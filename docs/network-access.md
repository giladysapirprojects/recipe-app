# Local Network Access Guide

This guide explains how to access your Recipe App from other devices on your local network (phones, tablets, other computers).

## Your Network Configuration

- **Your Mac's IP Address**: `10.0.0.225`
- **Backend API Port**: `3000`
- **Frontend Port**: `8000`

---

## Quick Start - Enable Network Access Now

Follow these commands in order to make your app accessible on your local network:

### 1. Stop Current Servers

First, stop your currently running servers. In the terminals where they're running, press:
```
Ctrl + C
```

Or find and kill the processes:
```bash
# Stop backend (Node.js)
lsof -ti:3000 | xargs kill -9

# Stop frontend (Python server)
lsof -ti:8000 | xargs kill -9
```

### 2. Update Backend for Network Access

Update the backend server to listen on all network interfaces:

```bash
# Edit server.js to bind to 0.0.0.0
cd /Users/giladsapir/Documents/Projects/recipe-app/backend
```

**Edit `backend/server.js` line 71:**

Change:
```javascript
app.listen(PORT, () => {
```

To:
```javascript
app.listen(PORT, '0.0.0.0', () => {
```

Or run this command to do it automatically:
```bash
sed -i '' 's/app.listen(PORT, () => {/app.listen(PORT, '\''0.0.0.0'\'', () => {/' server.js
```

### 3. Update Frontend API Configuration

Create a config file so the frontend knows where to find the backend:

```bash
cd /Users/giladsapir/Documents/Projects/recipe-app/frontend/scripts

# Create config.js
cat > config.js << 'EOF'
/* ============================================
   Recipe App - API Configuration
   Auto-detects localhost vs network access
   ============================================ */

// Auto-detect if we're on localhost or network
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'
  : 'http://10.0.0.225:3000';

console.log('API configured for:', API_BASE_URL);
EOF
```

**Update `frontend/scripts/storage.js` line 6:**

Change:
```javascript
const API_URL = 'http://localhost:3000/api';
```

To:
```javascript
import { API_BASE_URL } from './config.js';
const API_URL = `${API_BASE_URL}/api`;
```

Or run this command:
```bash
cd /Users/giladsapir/Documents/Projects/recipe-app/frontend/scripts
sed -i '' "6s|const API_URL = 'http://localhost:3000/api';|import { API_BASE_URL } from './config.js';\nconst API_URL = \`\${API_BASE_URL}/api\`;|" storage.js
```

### 4. Restart Backend with Network Binding

```bash
cd /Users/giladsapir/Documents/Projects/recipe-app/backend
npm start
```

You should see:
```
🚀 Recipe App Backend Server
📡 Server running on http://localhost:3000
```

The server is now accepting connections from any device on your network!

### 5. Restart Frontend with Network Binding

Open a new terminal:
```bash
cd /Users/giladsapir/Documents/Projects/recipe-app/frontend
python3 -m http.server 8000 --bind 0.0.0.0
```

You should see:
```
Serving HTTP on 0.0.0.0 port 8000 (http://[::]:8000/) ...
```

### 6. Test Network Access

**On your Mac:**
- Open http://localhost:8000 (should work as before)

**On your phone/tablet** (connected to same WiFi):
- Open http://10.0.0.225:8000 (should now work!)

---

## Quick Setup

### Step 1: Configure Backend to Listen on All Interfaces

The backend server is already configured correctly with CORS enabled, but we need to make sure it's listening on all network interfaces (not just localhost).

**Update backend/server.js:**

Change line 71 from:
```javascript
app.listen(PORT, () => {
```

To:
```javascript
app.listen(PORT, '0.0.0.0', () => {
```

This tells the server to accept connections from any IP address on your network.

---

### Step 2: Update Frontend API Configuration

The frontend needs to know where to find the backend API when accessed from other devices.

**Create a configuration file:**

Create `frontend/scripts/config.js`:
```javascript
// Auto-detect if we're on localhost or network
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'
  : 'http://10.0.0.225:3000';
```

**Update frontend/scripts/storage.js:**

Add at the top:
```javascript
import { API_BASE_URL } from './config.js';
```

Replace all instances of `'http://localhost:3000'` with `API_BASE_URL`.

---

### Step 3: Configure Python HTTP Server

The Python HTTP server needs to listen on all interfaces too.

**Stop the current server** (Ctrl+C) and restart with:
```bash
cd frontend
python3 -m http.server 8000 --bind 0.0.0.0
```

---

## Access Instructions

### From Your Mac (Host Computer)
- **Frontend**: http://localhost:8000
- **API**: http://localhost:3000

### From Other Devices on Your Network
- **Frontend**: http://10.0.0.225:8000
- **API**: http://10.0.0.225:3000

---

## Testing

1. **On your Mac**:
   - Open http://localhost:8000
   - Verify the app works normally

2. **On your phone/tablet** (connected to same WiFi):
   - Open browser
   - Go to http://10.0.0.225:8000
   - You should see the recipe app!

3. **Troubleshooting**:
   - Make sure all devices are on the same WiFi network
   - Check your Mac's firewall settings (System Preferences → Security & Privacy → Firewall)
   - If firewall is on, allow incoming connections for Node and Python

---

## Automated Startup Scripts

### Start Both Servers (Network Mode)

Create `start-network.sh`:
```bash
#!/bin/bash

echo "🚀 Starting Recipe App for Network Access"
echo "📍 Your network IP: 10.0.0.225"
echo ""

# Start backend
echo "Starting backend API..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend  
echo "Starting frontend server..."
cd ../frontend
python3 -m http.server 8000 --bind 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo ""
echo "Access from this computer:"
echo "  🌐 Frontend: http://localhost:8000"
echo "  📡 Backend:  http://localhost:3000"
echo ""
echo "Access from other devices on your network:"
echo "  🌐 Frontend: http://10.0.0.225:8000"
echo "  📡 Backend:  http://10.0.0.225:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

Make it executable:
```bash
chmod +x start-network.sh
```

Run it:
```bash
./start-network.sh
```

---

## Security Considerations

⚠️ **Important Security Notes:**

1. **Local Network Only**: These settings only expose the app to your local network (e.g., home WiFi). It's NOT accessible from the internet.

2. **No Authentication**: The app currently has no login system, so anyone on your WiFi can access it.

3. **Firewall**: Your Mac's firewall provides some protection. Keep it enabled.

4. **Public WiFi**: Do NOT use this setup on public WiFi networks (coffee shops, airports, etc.)

### Future Security Enhancements:
- Add user authentication (login/password)
- Use HTTPS with self-signed certificates
- Add rate limiting to prevent abuse
- Implement session management

---

## Advanced: Static IP (Optional)

If your IP address changes frequently (DHCP), you can set a static IP:

1. Open **System Preferences** → **Network**
2. Select your WiFi connection
3. Click **Advanced** → **TCP/IP**
4. Change **Configure IPv4** to **Manually**
5. Set:
   - IP Address: `10.0.0.225`
   - Subnet Mask: `255.255.255.0`
   - Router: `10.0.0.1` (usually, check your current router)
6. Click **OK** and **Apply**

---

## Troubleshooting

### "Cannot connect" from other devices

**Check firewall:**
```bash
# Check if firewall is blocking
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Temporarily disable (for testing only)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Re-enable after testing
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

**Verify servers are listening on all interfaces:**
```bash
# Check what port 3000 is listening on
lsof -i :3000

# Check what port 8000 is listening on
lsof -i :8000
```

### IP address changed

If your Mac's IP address changes:
1. Find new IP: `ipconfig getifaddr en0`
2. Update `frontend/scripts/config.js` with new IP
3. Restart servers

### DNS/Name Resolution (Alternative)

Instead of IP address, you can use your Mac's hostname:
```bash
# Find your hostname
hostname

# Use format: http://YOUR-HOSTNAME.local:8000
# Example: http://Gilads-MacBook.local:8000
```

---

## Quick Reference

| Access Type | Frontend URL | Backend URL |
|------------|--------------|-------------|
| **On Your Mac** | http://localhost:8000 | http://localhost:3000 |
| **Other Devices** | http://10.0.0.225:8000 | http://10.0.0.225:3000 |
| **Hostname (Alternative)** | http://YOUR-MAC.local:8000 | http://YOUR-MAC.local:3000 |

**Your Current IP**: `10.0.0.225`  
**Last Updated**: 2026-01-10

---

Ready to share your recipes with the family! 🍳✨
