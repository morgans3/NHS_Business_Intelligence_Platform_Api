# NHS BI Platform API Server

ExpressJS API for RESTful API endpoints that are deployed as a container within your VPC, to allow for secure interactions with your resources. There are also API endpoints deployed using serverless AWS technology where interaction with devices in your VPC is not required.

For serverless API endpoints please review the code in: <https://github.com/morgans3/NHS_Business_Intelligence_Platform>

## Deployment

This code will deploy as a docker container. For a method of automating the deployment of this server, along with the rest of our BI platform, please refer to: <https://github.com/morgans3/NHS_Business_Intelligence_Platform>

## Usage (API Calls)

API endpoints are stored in the `routes` folder and can be viewed by navigating to <https://api.YOUR_URL_HERE/api-docs/> after being deployed.

## Testing Locally

This codebase uses Swagger in order for local testing. Once you have pulled the repository to your local device, run the `npm run start:dev` from a command terminal.

The output will display the local port that the server is now deployed on. To view the Swagger documentation and begin testing navigate to `http://localhost:<PORT>/api-docs/`

## Terms of Use

This specific code repository and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence.

The code has been developed and is maintained by the NHS and where possible we will try to adhere to the NHS Open Source Policy (<https://github.com/nhsx/open-source-policy/blob/main/open-source-policy.md>).

It shall remain free to the NHS and all UK public services.

### Contributions

This code has been authored by Stewart Morgan (stewart.morgan@nhs.net) and colleagues in the Digital Intelligence Unit @ NHS Blackpool CCG.

_This project and all code within is © Crown copyright and available under the terms of the Open Government 3.0 licence._
