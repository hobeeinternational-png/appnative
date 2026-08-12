#!/usr/bin/env sh

# Expo may return code 0 after an interrupted web-preview session. Keep the
# watcher alive so concurrently does not terminate the API process with it.
set -u

stopping=0
child_pid=""

stop() {
  stopping=1
  if [ -n "$child_pid" ]; then
    kill -TERM "$child_pid" 2>/dev/null || true
  fi
}

trap stop INT TERM HUP

while [ "$stopping" -eq 0 ]; do
  EXPO_USE_METRO_WORKSPACE_ROOT=1 EXPO_WEB_PREVIEW=1 NODE_OPTIONS="--max-old-space-size=1536" npx expo start --web --max-workers 1 --port "${EXPO_PORT:-8081}" &
  child_pid=$!
  wait "$child_pid"
  exit_code=$?
  child_pid=""

  if [ "$stopping" -eq 1 ]; then
    break
  fi

  echo "[metro-supervisor] Metro exited with code ${exit_code}; restarting in 2 seconds."
  sleep 2
done

exit 0
