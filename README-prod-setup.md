# Setup AWS environments

## AWS Organizations
* Create `Production`, `Staging` and `DevService` accounts.
* Create a `Dev` organizational unit.

## Bootstrap environments

For *Production* and *Staging* environments run:

`npx cdk bootstrap aws://<id>/<region> --profile <profile>`

In addition, bootstrap the `us-east-1` region.

## Hosted zones

### Create hosted zones

In the *Production* account:
* Create the **root** hosted zone with a name `trip.pictures`.
* Copy the **root** hosted zone id to a variable named `rootHostedZoneId` in *backend/consts/appConsts.ts*.

In the *Staging* account:
* Create the **test** hosted zone with a name `test.trip.pictures`.
* Copy the **test** hosted zone id to a variable named `stagingHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the **test** zone into the *Production* account **root** zone.

In the *DevService* account:
* Create the **dev** hosted zone with name `dev.my-domain.com`.
* Copy the **dev** hosted zone id to a variable named `devHostedZoneId` in *backend/consts/appConsts.ts*.
* Copy the *NS* record from the **dev** zone into the *Production* account **root** zone.

### Add a policy for editing *Dev* hosted zone

In the *DevService* account create a policy named `HostedZoneRecords`.

<details>
    <summary>Policy content</summary>

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "route53:ChangeResourceRecordSets",
                "Resource": "arn:aws:route53:::hostedzone/<DEV HOSTED ZONE ID>"
            },
            {
                "Effect": "Allow",
                "Action": "route53:ListHostedZonesByName",
                "Resource": "*"
            }
        ]
    }
</details>

### Add a domain name

In the *HostedZones* account:

* Register a domain in Route53.
* Use the name servers from the **root** zone NS record.
* Copy the domain name to a variable named `rootDomain` in *shared/consts/sharedConsts.ts*

## Identity providers

Setup *OAuth* with the following 3 env names: *Dev*, *Stage*, *Prod*:

<details>
<summary>Apple</summary>

1. Go to your [Apple developer account](https://developer.apple.com/account).
2. Go to *Certificates, Identifiers & Profiles* > *Identifiers*
3. Add a new identifier for each environment (*Dev*, *Stage*, *Prod*).
4. Choose *App IDs*.
5. Type *App*.
6. Description: `<app-name> <env>`.
7. Bundle ID: `<app-name><env>`.
8. Select *Sign In with Apple* checkbox.
9. *Continue* > *Register*.
10. Select *Service IDs* from the dropdown on the right.
11. Add new *Service ID*.
12. Description: `<app-name> <env>` (skip ENV for *Prod*).
13. Identifier: `<app-name>Website<env>`.
14. Write the identifier to variables `appleClientIdDev`, `appleClientIdStaging` and `appleClientIdProd` in *backend/consts/appConsts.ts*.
14. *Continue* > *Register*.
15. Choose again the service from the list.
16. Check *Sign in with Apple*, click *Configure*.
17. Add `auth.trip.pictures` to *Domains and Subdomains*.
18. Add `https://auth.trip.pictures/oauth2/idpresponse` to *Return URLs*.
19. *Continue* > *Save*.
20. Go to *Keys* and create new.
21. Key name: `<app-name><env>`.
22. Check *Sign in with Apple*, click *Configure*, choose the primary App ID.
23. *Save* > *Continue* > *Register* > *Download* > *Done*.
24. Copy the key ids to variables `appleKeyIdDev`, `appleKeyIdStaging` and `appleKeyIdProd` in *backend/consts/appConsts.ts*.
25. In the AWS accounts (*DevService*, *Staging* and *Production) add a string parameter to *Parameter store* (for *DevService* use a **secure** string) and put the downloaded private key in it.
26. Copy the name of the string parameter to a single variable named `applePrivateKeyParamName` in *backend/consts/appConsts.ts*.
</details>



<details>
<summary>Google</summary>

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials) in *Google Cloud*.
2. Click *Create credentials* > *OAuth client ID*.
3. Select the *Web application* type.
4. Add `https://auth.trip.pictures` to *Authorized JavaScript origins* .
5. Add `https://auth.trip.pictures/oauth2/idpresponse` to *Authorized redirect URIs*.
6. Copy *Client ID* to variables named `googleClientIdDev`, `googleClientIdStaging` and `googleClientIdProd` in *backend/consts/appConsts.ts*.
7. In the AWS accounts (*DevService*, *Staging* and *Production*) add a string parameter to *Parameter store* (for *DevService* use a **secure** string) and put the *Client secret* in it.
8. Copy the name of the string parameter to a single variable named `googleClientSecretParamName` in *backend/consts/appConsts.ts*.
</details>

### Add a policy for reading the *Dev* identity provider secrets

In the *DevService* account add a policy named `IdentityProvidersSecrets`.

<details>
    <summary>Policy content</summary>

    {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "ssm:GetParameters",
              "Resource": [
                  "arn:aws:ssm:<region>:<account-id>:parameter/<google-client-secret-parameter-name>",
                  "arn:aws:ssm:<region>:<account-id>:parameter/<apple-private-key-parameter-name>"
              ]
          }
      ]
    }
</details>

## Role for personal dev accounts

In the *DevService* account create a role named `DevAccountServiceRole`.

Add a custom trust policy:

<details>
    <summary>Custom trust policy</summary>

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "sts:AssumeRole",
                "Condition": {
                    "ForAnyValue:StringLike": {
                        "aws:PrincipalOrgPaths": "<path-to-dev-organizational-unit>/*"
                    }
                }
            }
        ]
    }
</details>

(*aws:PrincipalOrgPaths* is similar to `o-dqkaknenun/r-weph/ou-weph-n389l0xd`)

Attatch the *HostedZoneRecords* and *IdentityProvidersSecrets* policies.

Copy the ARN of *DevAccountServiceRole* role to a variable named `devAccountServiceRoleArn` in *backend/consts/appConsts.ts*.

---

# How to add developers to the project

Personal accounts need permissions to assume the *DevAccountServiceRole* from the *DevService* account.

Choose one of the two options:

* Option 1: Add permissions for their own account to assume the *DevAccountServiceRole*.
* Option 2: Create a personal account in the *Dev* organizational unit (permission are already set).

<details>
    <summary>Option 1: Adding permissions for their own account</summary>

     {
        "Effect": "Allow",
        "Principal": {
            "AWS": "<ACCOUNT_ID>"
        },
        "Action": "sts:AssumeRole"
    }
</details>

For both options:

In [Apple console](https://developer.apple.com/account):
* Add `auth.<user name>.trip.pictures` to *Domains and Subdomains*.
* Add `https://auth.<user name>.trip.pictures/oauth2/idpresponse` to *Return URLs*.

In [Google console](https://console.cloud.google.com/apis/credentials):
* Add `https://auth.<user name>.trip.pictures` to *Authorized JavaScript origins* .
* Add `https://auth.<user name>.trip.pictures/oauth2/idpresponse` to *Authorized redirect URIs*.

