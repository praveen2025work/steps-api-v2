# Hosting Your STEPS Application Locally

This guide will help you run your STEPS application on your laptop in a way that makes it accessible to others on your network.

## Prerequisites

- Node.js 20.x installed on your laptop
- Your laptop connected to the same network as the people who need to access your application

## Step 1: Find Your Local IP Address

Before starting the server, you need to know your laptop's IP address on the local network:

### On Windows:
1. Open Command Prompt
2. Type `ipconfig` and press Enter
3. Look for the "IPv4 Address" under your active network connection (usually starts with 192.168.x.x or 10.x.x.x)

### On macOS:
1. Open System Preferences > Network
2. Select your active connection (Wi-Fi or Ethernet)
3. Your IP address will be displayed on the right side

### On Linux:
1. Open Terminal
2. Type `hostname -I` or `ip addr` and press Enter
3. Look for the IP address (usually starts with 192.168.x.x or 10.x.x.x)

## Step 2: Start the Development Server with Host Flag

1. Open a terminal/command prompt in your project directory
2. Run the following command:

```bash
npm run dev -- -H 0.0.0.0
```

This tells Next.js to listen on all network interfaces, not just localhost.

## Step 3: Access the Application

- On your laptop, you can access the application at: http://localhost:3000
- Others on your network can access it at: http://YOUR_IP_ADDRESS:3000 (replace YOUR_IP_ADDRESS with the IP address you found in Step 1)

## Troubleshooting

### Firewall Issues
If others cannot access your application, your laptop's firewall might be blocking incoming connections:

#### Windows:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" > "Allow another app"
4. Browse to your Node.js executable or add port 3000 to the allowed ports

#### macOS:
1. Open System Preferences > Security & Privacy > Firewall
2. Click "Firewall Options"
3. Add Node.js to the list of allowed applications or configure to allow incoming connections on port 3000

### Using a Different Port
If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -H 0.0.0.0 -p 3001
```

Then others would access your application at http://YOUR_IP_ADDRESS:3001

## Alternative: Using a Tunneling Service

If you need to share your application with people outside your local network, you can use a tunneling service like ngrok:

1. Install ngrok: https://ngrok.com/download
2. Start your application normally: `npm run dev`
3. In a separate terminal, run: `ngrok http 3000`
4. Share the provided ngrok URL with anyone who needs access

## For Production Use

Note that this setup is for development and testing purposes. For production use, you should:

1. Build the application: `npm run build`
2. Start the production server: `npm start -- -H 0.0.0.0`

This will provide better performance and security for real-world usage.