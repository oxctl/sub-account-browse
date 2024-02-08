# Subaccount Browse

[![Frontend DEV](https://github.com/oxctl/sub-account-browse/actions/workflows/frontend_dev.yml/badge.svg)](https://github.com/oxctl/sub-account-browse/actions/workflows/frontend_dev.yml)

This small tool is to allow people to browse the sub-account hierarchy who don't have permission to change the sub-account hierarchy.

## SSL

### Development

To enable SSL in development:
 
* Install [mkcert](https://github.com/FiloSottile/mkcert)
* Create a cert for localhost: `mkcert localhost`
* Start dev server: `npm start`

This works because our webpack config checks for `localhost.pem` and `localhost-key.pem` and if they exist starts in HTTPS mode instead.


## Configuration

This tool needs to have a developer key setup for it with permission to view account sub accounts. 

### Automatic Configuration

There is [lti-auto-configuration](https://github.com/oxctl/lti-auto-configuration) that will attempt to automatically configure Canvas and the Tool Support server (it is installed as a development dependency). To use this copy the configuration example:

```bash
cp tool-config/local-example.json tool-config/local.json
```
Then configure the values in `local.json` to match your setup. Then to deploy the tool run:
```bash
lti-auto-configuration -t tool-config/tool-config.json -s tool-config/local.json  -ss tool-config/local.json  -c
```
This should add a copy of the tool and make it available for testing. You can then tidy up with:
```bash
lti-auto-configuration -t tool-config/tool-config.json -s tool-config/local.json  -ss tool-config/local.json  -d
```

### LTI Key

To configure the tool in Canvas setup a new LTI Developer key:

* Key name: View Sub-accounts


* Owner email: 
  #### Production
  - acit-sys-apps@maillist.ox.ac.uk
  #### Dev
  - Enter your work email

* Redirect URIs: 
  #### Production
  - https://lti.canvas.ox.ac.uk/lti/login
  #### Dev
  - https://lti-dev.canvas.ox.ac.uk/lti/login

* Method: Manual entry
* Title: View Sub-accounts
* Description: A read only view of the sub-accounts.
* Target Link URI:
  #### Production
  - https://canvas-subaccounts.canvas.ox.ac.uk
  #### Dev
  - https://master.canvas-subaccounts.pages.dev
* OpenID Connect Initiation URL: 
  #### Production
  - https://lti.canvas.ox.ac.uk/lti/login_initiation/universityofoxford-sa-`yourFirstName`
  #### Dev
  - https://lti-dev.canvas.ox.ac.uk/lti/login_initiation/oxeval-sa-`yourFirstName`

* JWK Method: Public JWK URL - 
  #### Production
  - https://lti.canvas.ox.ac.uk/.well-known/jwks.json
  #### Dev
  - https://lti-dev.canvas.ox.ac.uk/.well-known/jwks.json
  
* Additional Settings: Custom fields:

    canvas_account_id=${Canvas.account.id}
    canvas_account_name=${Canvas.account.name}
    canvas_api_base_url=$Canvas.api.baseUrl
    com_instructure_brand_config_json_url=$com.instructure.brandConfigJSON.url
    canvas_user_prefers_high_contrast=${Canvas.user.prefersHighContrast}


* Privacy Level: Public
* Placements: Account Navigation

### API Key

To configure the proxy a API Developer key is needed:

* Key name: View Sub-accounts
* Owner email: acit-sys-apps@maillist.ox.ac.uk
* Redirect URIs: 
  #### Production
  - https://proxy.canvas.ox.ac.uk/login/oauth2/code/universityofoxford-sa-`yourFirstName`
  #### Dev
  - https://proxy-dev.canvas.ox.ac.uk/login/oauth2/code/oxeval-sa-`yourFirstName`

* Enforce Scopes: Checked
* Scopes:
  * url:GET|/api/v1/accounts/:account_id/courses
  * url:GET|/api/v1/accounts/:account_id/sub_accounts

## Deployment

This code is deployed to Cloudflare.

### Development 

The deploy to development is done automatically when a new commit is made to master.

### Releasing

To release the latest code merge the master branch into the release branch Cloudflare will then deploy this to production.
The best way to do this is to create a PR from `master` to `release`, this allows you to check what's going to be released.
There is a GitHub action that can be manually run to do this.

Alternatively to do this locally run checkout the release branch, fetch the latest code from the origin and run:
```shell
git merge origin/master
```

To see what is about to go into a release you can preview the changes between [master and release](https://github.com/oxctl/sub-account-browse/compare/release...master), then to double check a PR can be created to merge the changes, reviewed and merged (at which point the release branch is built and deployed).


## Notes

### GraphQL

Canvas has a GraphQL endpoint and in theory it would have been very useful for this tool (it supports accounts and courses)
however it doesn't allow us to find out the count of courses in a sub-account (we would have to load them all). There's
also no way to load the SIS ID on the account (although we're not using this at the moment.)


For easy setup, we've included all of our build presets. This includes
configurations for webpack, babel, eslint, etc, and allows you to start developing
immediately.

To get started, you can import and compose existing components from our library.
We've included a few commonly used ones already to render the landing page.
