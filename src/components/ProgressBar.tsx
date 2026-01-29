interface ProgressBarProps {
  percentage: number;
}

const ProgressBar = ({ percentage }: ProgressBarProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  let bgColor = 'bg-blue-600';
  if (clampedPercentage >= 100) {
    bgColor = 'bg-green-500';
  } else if (clampedPercentage >= 50) {
    bgColor = 'bg-indigo-600';
  }

  return (
    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${bgColor}`}
        style={{ width: `${clampedPercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
