import asyncio
from playwright.async_api import async_playwright
from typing import List, Dict, Any

async def run_scenario(steps: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes a list of test steps using Playwright.
    Expected step structure:
    {
        "action_type": "navigate" | "click" | "fill" | "wait" | "check_text",
        "selector": str,
        "value": str (for fill or check_text or wait time)
    }
    """
    browser = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            for step in steps:
                action = step.get("action_type")
                selector = step.get("selector")
                value = step.get("value")
                
                if action == "navigate":
                    await page.goto(value)
                elif action == "click":
                    await page.click(selector)
                elif action == "fill":
                    await page.fill(selector, value)
                elif action == "wait":
                    wait_time = int(value) if value else 1000
                    await page.wait_for_timeout(wait_time)
                elif action == "check_text":
                    content = await page.content()
                    if value not in content:
                        return {"success": False, "message": f"Text '{value}' not found on page."}
                else:
                    return {"success": False, "message": f"Unknown action type: {action}"}
            
            return {"success": True, "message": "Test completed successfully."}
            
    except Exception as e:
        return {"success": False, "message": "An error occurred during test execution.", "error": str(e)}
    finally:
        if browser:
            await browser.close()
