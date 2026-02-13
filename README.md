# Subaccount Browse

This is small tool to allow sub-account administrators to browse the sub-account hierarchy. It is useful becuase of the lack of granularity in permissions relating to the Canvas sub-account hierarchy.

## SSL

### Development

To enable SSL in development:
 
* Install [mkcert](https://github.com/FiloSottile/mkcert) and initialise (`mkcert -install`).
* Start dev server: `npm start`

This will use the mkcert plugin which will use a trusted self-signed certificate for the development server.

## Configuration

This tool needs to have a developer key setup for it with permission to view account sub accounts. 

### Automatic Configuration

There is [lti-auto-configuration](https://github.com/oxctl/lti-auto-configuration) which will attempt to automatically configure Canvas and the Tool Support server (it is installed as a development dependency). To use this, run the initialisation process which will generate a local configuration example:

```bash
npx @oxctl/lti-auto-configuration setup
```
Then configure the values in `local.json` to match your setup. 

To deploy the tool run:
```bash
npx @oxctl/lti-auto-configuration create
```
This should add a copy of the tool and make it available for testing. 

Should you change the config and need to update:
```bash
npx @oxctl/lti-auto-configuration update
```

You can then tidy up with:
```bash
npx @oxctl/lti-auto-configuration delete
```


## Deployment

This code is deployed to Cloudflare. Aa automatic deploy to the Preview environment happens when a new commit is made to `master`.

### Releasing

To release the latest code, merge the `master` branch into the `release` branch. Cloudflare will then deploy this to the Production environment.
The best way to do this is to create a PR from `master` to `release`, this allows you to check what's going to be released.
There is a [GitHub action](actions/workflows/release.yml) that can be manually run to do this.

Alternatively, to do this locally, check out the `release` branch, fetch the latest code from `origin`, and run:
```shell
git merge origin/master
```

To see what is about to go into a release you can preview the changes between [master and release](compare/release...master), then to double check a PR can be created to merge the changes, reviewed and merged (at which point the release branch is built and deployed).

## Sentry

Application errors are reported using https://sentry.io for this application. There is one DSNs to be used for both development and production. There's no DSN for local development. Sentry is setup as early as possible in the application to capture as many errors as possible.



## Notes

### GraphQL

Canvas has a GraphQL endpoint and in theory it would have been very useful for this tool (it supports accounts and courses)
however it doesn't allow us to find out the count of courses in a sub-account (we would have to load them all). There's
also no way to load the SIS ID on the account (although we're not using this at the moment.)
