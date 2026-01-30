from fastapi import FastAPI, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from typing import List
from uuid import UUID

import models
import database
import runner

app = FastAPI(title="Playwright Smoke Test Engine")
templates = Jinja2Templates(directory="templates")
supabase = database.get_supabase_async_client()

# --- API Endpoints ---

@app.get("/api/sites", response_model=List[models.Site])
async def get_sites():
    response = await supabase.table("sites").select("*").execute()
    return response.data

@app.post("/api/sites", response_model=models.Site)
async def create_site(site: models.SiteCreate):
    response = await supabase.table("sites").insert(site.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create site")
    return response.data[0]

@app.get("/api/scenarios/{site_url:path}", response_model=List[models.TestScenario])
async def get_active_scenarios_by_url(site_url: str):
    # First find the site
    site_res = await supabase.table("sites").select("id").eq("url", site_url).execute()
    if not site_res.data:
        raise HTTPException(status_code=404, detail="Site not found")
    
    site_id = site_res.data[0]["id"]
    scenarios_res = await supabase.table("test_scenarios")\
        .select("*")\
        .eq("site_id", site_id)\
        .eq("is_active", True)\
        .order("step_order")\
        .execute()
    
    return scenarios_res.data

@app.post("/api/scenarios", response_model=models.TestScenario)
async def create_scenario(scenario: models.TestScenarioCreate):
    response = await supabase.table("test_scenarios").insert(scenario.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create scenario")
    return response.data[0]

@app.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: UUID):
    response = await supabase.table("test_scenarios").delete().eq("id", str(scenario_id)).execute()
    return {"status": "success"}

@app.post("/api/run-test/{site_id}", response_model=models.TestResult)
async def trigger_test(site_id: UUID):
    scenarios_res = await supabase.table("test_scenarios")\
        .select("*")\
        .eq("site_id", str(site_id))\
        .eq("is_active", True)\
        .order("step_order")\
        .execute()
    
    if not scenarios_res.data:
        return models.TestResult(success=False, message="No active scenarios found for this site.")
    
    result = await runner.run_scenario(scenarios_res.data)
    return models.TestResult(**result)

# --- Dashboard Routes ---

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_index(request: Request):
    sites = await get_sites()
    return templates.TemplateResponse("index.html", {"request": request, "sites": sites})

@app.post("/dashboard/sites")
async def dashboard_add_site(name: str = Form(...), url: str = Form(...)):
    site_data = models.SiteCreate(name=name, url=url)
    await create_site(site_data)
    return RedirectResponse(url="/dashboard", status_code=303)

@app.get("/dashboard/sites/{site_id}", response_class=HTMLResponse)
async def dashboard_site_detail(request: Request, site_id: UUID):
    site_res = await supabase.table("sites").select("*").eq("id", str(site_id)).execute()
    if not site_res.data:
        raise HTTPException(status_code=404, detail="Site not found")
    
    scenarios_res = await supabase.table("test_scenarios")\
        .select("*")\
        .eq("site_id", str(site_id))\
        .order("step_order")\
        .execute()
    
    return templates.TemplateResponse("site_detail.html", {
        "request": request, 
        "site": site_res.data[0], 
        "scenarios": scenarios_res.data
    })

@app.post("/dashboard/scenarios")
async def dashboard_add_scenario(
    site_id: UUID = Form(...),
    action_type: str = Form(...),
    selector: str = Form(None),
    value: str = Form(None),
    step_order: int = Form(...)
):
    scenario_data = models.TestScenarioCreate(
        site_id=site_id,
        action_type=action_type,
        selector=selector,
        value=value,
        step_order=step_order
    )
    await create_scenario(scenario_data)
    return RedirectResponse(url=f"/dashboard/sites/{site_id}", status_code=303)

@app.post("/dashboard/scenarios/delete/{scenario_id}")
async def dashboard_delete_scenario(scenario_id: UUID, site_id: UUID = Form(...)):
    await delete_scenario(scenario_id)
    return RedirectResponse(url=f"/dashboard/sites/{site_id}", status_code=303)

@app.post("/dashboard/run/{site_id}", response_class=HTMLResponse)
async def dashboard_run_test(request: Request, site_id: UUID):
    result = await trigger_test(site_id)
    return templates.TemplateResponse("test_result.html", {"request": request, "result": result})

@app.get("/", response_class=RedirectResponse)
async def root():
    return RedirectResponse(url="/dashboard")
