# Lexical DevTools browser extension

This is the source code for the Lexical DevTools browser extension.

[link-chrome]: https://chromewebstore.google.com/detail/lexical-developer-tools/kgljmdocanfjckcgfpcpdoklodllfdpc 'Version published on Chrome Web Store'
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/lexical-developer-tools/ 'Version published on Mozilla Add-ons'
[link-safari]: https://apps.apple.com/us/app/lexical-developer-tools/id6502753400 'Version published on Mac App Store'

[<img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/chrome/chrome.svg" width="48" alt="Chrome logo" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/kgljmdocanfjckcgfpcpdoklodllfdpc?style=flat&label=%20">][link-chrome]

[<img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/firefox/firefox.svg" width="48" alt="Firefox logo" valign="middle">][link-firefox] [<img valign="middle" src="https://img.shields.io/amo/v/lexical-developer-tools.svg?label=%20">][link-firefox]

[<img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/safari/safari.svg" width="48" alt="Safari logo" valign="middle">][link-safari] [<img valign="middle" src="https://img.shields.io/itunes/v/6502753400?label=%20">][link-safari]

## Local development

Lexical DevTools extension uses [WXT](https://wxt.dev/) framework to simplify development. Please refer to [WXT Development Guide](https://wxt.dev/guide/development.html) for comprehensive documentation.

**TLDR:**
```bash
$ pnpm run dev
# In browser: Alt+R to force reload extension
```

**Useful Hints:**
- Extension activity log: [chrome://extensions/?activity=eddfjidloofnnmloonifcjkpmfmlblab](chrome://extensions/?activity=eddfjidloofnnmloonifcjkpmfmlblab)
- Status of ServiceWorkers: [chrome://serviceworker-internals/?devtools](chrome://serviceworker-internals/?devtools)
- WXT Framework debugging: `DEBUG_WXT=1 pnpm run dev`
- If you detach the Dev Tools in a separate window, and press `Cmd+Option+I` while Dev Tools window is focused, you will invoke the Dev Tools for the Dev Tools window.

**Safari:**

To develop and run Safari version of the extension you (obviously) need a Mac and Xcode installed. Safari on the contrary to other browsers doesn't accept web extensions as a zip archive but rather requires you to [wrap it in native code (Swift) wrapper](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari/). Fortunately this process is mostly automated here.

```bash
# Install Xcode

# Environment setup
sudo xcode-select -s /Applications/Xcode.app
xcodebuild --install
sudo xcodebuild -license
xcodebuild -runFirstLaunch

# Normal operation
pnpm run dev:safari

# Build & upload to Apple Connect
BUILD_VERSION=0 pnpm run safari:archive 
PASSWORD="XXX" pnpm run safari:upload
```

## Publishing flow

**Preconditions:**

If new version of the extension contains big changes to it's UI or functionality, before proceeding, go to the web UI of every marketplace and update screenshots and preview videos.

**Chrome, Firefox:**

Go to the ["Publish DevTools extension to stores" GitHub action](https://github.com/facebook/lexical/actions/workflows/devtools-extension-publish.yml) and start it manually. "Build version" is a whole number appended to the package version (`0.52.0` becomes `0.52.0.0`); increase it when publishing more than once within a single Lexical monorepo version. Tick "Dry run" to check the store credentials without uploading anything.

The workflow reads these repository secrets:

- `EXTENSION_FIREFOX_JWT_ISSUER`, `EXTENSION_FIREFOX_JWT_SECRET`: an API key from https://addons.mozilla.org/developers/addon/api/key/ belonging to an author of the add-on.
- `EXTENSION_CHROME_PUBLISHER_ID`: the id in the developer dashboard URL, `https://chrome.google.com/webstore/devconsole/<publisher-id>`.
- `EXTENSION_CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`, `EXTENSION_CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`: the `client_email` and `private_key` fields of a JSON key for a Google Cloud service account that has the Chrome Web Store API enabled and has been added to the publisher in the dashboard's account settings, following [Use service accounts with the Chrome Web Store API](https://developer.chrome.com/docs/webstore/service-accounts). Paste the private key with real line breaks, not `\n` escapes.

Running `pnpm --filter @lexical/devtools exec wxt submit init` walks through creating the same values interactively.

**Safari:**

Automation is pending, pls contact vladlen_fedosov@epam.com

## Requesting maintainer access to extension marketplaces

At this moment all marketplaces are governed by [EPAM Open Source Office](https://www.epam.com/open-source) (contact [Vladlen Fedosov](mailto:vladlen_fedosov@epam.com) or [Christopher Howard](mailto:christopher_howard@epam.com)) and the access request flow is the following:

**Firefox:**

1. Create Mozilla account: https://accounts.firefox.com/settings
2. Enable two factor authentication for this account.
3. Go to https://addons.mozilla.org/en-US/firefox/users/edit and set a "Display Name" for your account.
4. Email to [Vladlen Fedosov](mailto:vladlen_fedosov@epam.com) and [Christopher Howard](mailto:christopher_howard@epam.com) with the request to add you as a maintainer to Firefox Add-Ons for Lexical Developer Tools extension. Pls include: Firefox account email; reasoning description.
5. _[For Maintainer]_ Open [authors & license management page](https://addons.mozilla.org/en-US/developers/addon/lexical-developer-tools/ownership) and add new user email.

**Chrome:**

Google limits [Extension Group Publisher](https://developer.chrome.com/docs/webstore/group-publishers/) member accounts to have the same domain names. So at this moment please reach out to [Vladlen Fedosov](mailto:vladlen_fedosov@epam.com) and [Christopher Howard](mailto:christopher_howard@epam.com) if you need to do any changes to the extension listing. Use publishing flow described above to release new versions.

We consider moving publisher to `@thelexical.onmicrosoft.com` or linking `lexical.dev` to `thelexical.onmicrosoft.com` AD.

**Safari:**

Apple limits App Store Connect member accounts to have the same domain names. So at this moment please reach out to [Vladlen Fedosov](mailto:vladlen_fedosov@epam.com) and [Christopher Howard](mailto:christopher_howard@epam.com) if you need to do any changes to the extension listing. New version publishing flow is automation is coming soon.

We consider creating new Apple Store Connect for `thelexical.onmicrosoft.com` AD, but it requires DUNS registered organization.

## Design

This extension follows typical [Browser DevTools architecture](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools) that includes sereral independent contexts that communicate via events or extension APIs.

<figure align="center">
  <img src="./docs/architecture-diagram.png" alt="DevTools extension architecture" width="526">
  <figcaption>DevTools extension architecture.</figcaption>
</figure>
