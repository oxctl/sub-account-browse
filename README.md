# Canvas Subaccount Browser

[![Frontend DEV](https://github.com/oxctl/canvas-subaccounts/actions/workflows/frontend_dev.yml/badge.svg)](https://github.com/oxctl/canvas-subaccounts/actions/workflows/frontend_dev.yml)

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
* Target Link URI: https://oxctl-canvas-subaccounts-prod.s3-eu-west-1.amazonaws.com/index.html
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

This codebase is deployed into AWS S3 buckets by GitHub Actions. The deployments to the environments are noted on the
GitHub page under the environments. 

### Development 

The deploy to development is done automatically when a new commit is made to master.

### Production

To deploy a new release to production do with a minor version increment (eg 1.6.0 -> 1.7.0), see the
[npm versions](https://docs.npmjs.com/cli/v7/commands/npm-version) page for details on how to increment different parts
of the version number.

    npm version minor

This will increment the build version, create a git tag and push the changes to the repository. The new version will
then get deployed to the development environment. Then if the deployment went OK you should be able to deploy the new
version to the production environment using the GitHub Action for production deploys. It's a manual job that requests
git version to deploy eg (v1.7.0, all tag names start with a 'v').

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
