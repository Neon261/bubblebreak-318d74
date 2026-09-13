# BubbleBreak

[![Built with Bilt](https://img.shields.io/endpoint?url=https%3A%2F%2Fapp.bilt.me%2Fapi%2Fbadge)](https://bilt.me)

BubbleBreak is a mobile-first social app designed to help people step outside their usual social circles and make spontaneous, meaningful connections in Hamburg. It is aimed especially at people who are new to the city, feel alone, or simply want to meet others and do something nearby.

Instead of browsing profiles, users choose a nearby public place or event, send out a local “ping,” and form a small group with people who are ready to join. BubbleBreak then helps the group agree on a meeting time and continue the conversation in a shared chat.

A second way to use BubbleBreak is for moments when you do not already have a plan or simply have no idea what to do. Instead of creating your own Ping, you can browse existing invitations nearby, see what other people are planning, and spontaneously join a plan that interests you. This makes it easy to turn an unplanned afternoon or evening into a shared experience with people around you.

## What the app does

- Guides new users through a playful profile and introduction flow.
- Discovers curated places and time-based events around Hamburg within an adjustable radius.
- Presents nearby ideas on a map or as a list, grouped by categories such as food, culture, music, sports, and outdoor activities.
- Lets a host choose an activity and set the number of available participant spots.
- Sends a simulated local Ping and shows interested participants joining over time.
- Lets users discover existing nearby Pings and join other people’s plans when they do not want to create one themselves.
- Allows participants to choose how much time they need before leaving.
- Calculates a shared meeting time using each participant’s preparation and travel time.
- Creates a group plan with destination details, participant status, map information, and chat.
- Includes local notifications and profile controls for interests, radius, group size, and account logout.

## Product direction

BubbleBreak explores whether technology can create meaningful connections by combining a shared reason to meet with different backgrounds, skills, and perspectives. The longer-term direction is to use AI to assemble thoughtfully mixed small groups, explain why the mix could work, and generate a short social mission that helps strangers connect.

The current app is an MVP prototype. Its people, invitations, responses, and verification experience are simulated for demonstration purposes; they should not be interpreted as a live social network or real identity verification.

## Project info

**Project URL**: https://app.bilt.me/agent/318d74d9-bad4-4cf4-aca0-d0bdb54c5d78

**Project ID**: `318d74d9-bad4-4cf4-aca0-d0bdb54c5d78`

## How can I edit this app?

There are several ways of editing your application.

**Use Bilt**

Simply visit your [Bilt Project](https://app.bilt.me/agent/318d74d9-bad4-4cf4-aca0-d0bdb54c5d78) and start sending messages. Describe what you want to change, add, or fix in natural language.

Changes made via Bilt are instant - just send a message and your app updates.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can export the source code from Bilt and make changes directly.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Export and clone your Bilt project.
# (Download source from Bilt or connect to your git repo)
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the Expo development server.
npx expo start
```

Scan the QR code with Expo Go on your phone to see your app running locally.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- React Native and Expo
- TypeScript
- Expo Router for navigation
- Zustand and AsyncStorage for app state and local persistence
- Bilt Cloud for backend and authentication capabilities
- HeroUI Native and Uniwind for the interface and theme
- Cross-platform maps and Expo notifications

The project was created and developed with Bilt from natural-language product instructions.

## How can I test this project?

**Option 1: Preview in Bilt (Recommended)**

Open your [Bilt Project](https://app.bilt.me/agent/318d74d9-bad4-4cf4-aca0-d0bdb54c5d78) and use the built-in preview.

Open **Deploy & Share** to create a revocable preview link or build the app on your iPhone.

**Option 2: Run Locally**

```sh
npm install
npx expo start
```

Then scan the QR code with Expo Go.

## How can I deploy this project?

Open your [Bilt Project](https://app.bilt.me/agent/318d74d9-bad4-4cf4-aca0-d0bdb54c5d78), select **Deploy & Share**, then choose **Publish to web**, **Release on App Store**, or **Release on Play Store**.

### Deploy with Bilt

Publishing to web creates a public, installable web app at its own URL. Bilt also guides you through preparing native releases for the App Store and Play Store.

## How can I make changes to my app?

**Via Bilt (Easiest)**

Visit your [Bilt Project](https://app.bilt.me/agent/318d74d9-bad4-4cf4-aca0-d0bdb54c5d78) and send a message describing what you want:

- "Add a dark mode toggle"
- "Change the button color to blue"
- "Add a new screen for user settings"
- "Fix the navigation bar spacing"

Bilt understands natural language and updates your app automatically.

**Via Code**

Export the source, make changes in your IDE, and test locally with `npx expo start`.

## Can I use this with the MCP protocol?

Yes! Bilt is available as a remote MCP server at `https://mcp.bilt.me/mcp`.

Connect any MCP-compatible AI agent (Claude Desktop, OpenClaw, etc.) to programmatically build and modify mobile apps.

**Example MCP integration:**

```json
{
  "mcpServers": {
    "bilt": {
      "transport": {
        "type": "sse",
        "url": "https://mcp.bilt.me/mcp/sse",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      }
    }
  }
}
```

Read more:

- [Bilt MCP Documentation](https://bilt.me/docs)
- [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.buildingapplications%2Fmcp/versions/latest)

## Need help?

- 📚 [Bilt Documentation](https://bilt.me/docs)
- 💬 [Discord Community](https://discord.gg/3FqNgmSYdZ)
- 🐦 [Twitter Updates](https://twitter.com/biltmeanapp)
- 📧 Email: support@bilt.me

---

<div align="center">

**Built by AI. No code required.** ✨

[Try Bilt](https://bilt.me) • [View Docs](https://bilt.me/docs) • [Docs MCP Server](https://bilt.me/docs/mcp)

</div>
