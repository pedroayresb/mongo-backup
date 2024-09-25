function generateLogBars(progress: number, total: number) {
  const percentage = (progress / total) * 100;
  const progressBars = Math.floor(percentage / 10);
  const emptyBars = 10 - progressBars;

  return `${"=".repeat(progressBars)}${" ".repeat(emptyBars)}`;
}

export default generateLogBars;
