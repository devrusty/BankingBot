const ProgressBarMax = 10

export function CreateProgressBar(progress: number) {
    if (progress > ProgressBarMax) {
        console.log(`Progress bar is out of range of ${ProgressBarMax}`)
        return
    }
    const progressBar = `${"🟩".repeat(progress)}${"⬛".repeat(ProgressBarMax - progress)}`
    return progressBar
}