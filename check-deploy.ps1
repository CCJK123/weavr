try {
	$r = Invoke-WebRequest -UseBasicParsing -Uri 'https://weavr.mountainous-turret.workers.dev' -TimeoutSec 10
	Write-Output "STATUS: $($r.StatusCode)"
} catch {
	Write-Output "FAILED: $($_.Exception.Message)"
}
