# NEXUS Grid Runbook

## Common Failures & Troubleshooting

### Problem: Server fails to start with SSL error
- **Symptom:** Log shows "Error: ENOENT: no such file or directory, open './certs/key.pem'".
- **Cause:** SSL certificates are missing.
- **Solution:** Run `npm run generate:certs` from the project root.

### Problem: API returns 503 Service Unavailable on /health
- **Symptom:** Docker container for `nexus-server` is restarting. `docker logs nexus-server` shows DB connection errors.
- **Cause:** The database container (`nexus-db`) is not healthy or accessible.
- **Solution:**
  1. Check database logs: `docker logs nexus-db`.
  2. Ensure `.env` variables for the database are correct.
  3. Restart the stack: `docker-compose down && docker-compose up -d`.

### Problem: Motion detection is not working
- **Symptom:** No motion events are being received by the frontend.
- **Cause:** The `nexus-motion-detector` container is not running or is unable to connect to the video stream.
- **Solution:**
  1. Check the logs of the `nexus-motion-detector` container: `docker logs nexus-motion-detector`.
  2. Ensure that the RTSP stream URL is correct and accessible from the container.
  3. Check the Redis connection.

### Problem: Recording is not working
- **Symptom:** No recordings are being saved to the filesystem.
- **Cause:** The `nexus-server` container is unable to connect to the video stream or does not have permission to write to the recordings directory.
- **Solution:**
  1. Check the logs of the `nexus-server` container: `docker logs nexus-server`.
  2. Ensure that the RTSP stream URL is correct and accessible from the container.
  3. Check the permissions of the recordings directory.

### Problem: Frontend is not loading correctly
- **Symptom:** The frontend is not loading correctly in the browser.
- **Cause:** The `nexus-proxy` container is not running or is not configured correctly.
- **Solution:**
  1. Check the logs of the `nexus-proxy` container: `docker logs nexus-proxy`.
  2. Ensure that the `nginx.conf` file is correct and that the SSL certificates are in the correct location.