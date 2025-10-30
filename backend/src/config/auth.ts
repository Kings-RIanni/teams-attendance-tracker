import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config();

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (!containsPii) {
          console.log(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    }
  }
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

export const getAuthUrl = () => {
  const authCodeUrlParameters = {
    scopes: [
      'User.Read',
      'OnlineMeetings.Read',
      'OnlineMeetings.ReadWrite',
      'Calendars.Read',
      'CallRecords.Read.All'
    ],
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3001/auth/callback',
  };

  return msalClient.getAuthCodeUrl(authCodeUrlParameters);
};

export const acquireTokenByCode = async (code: string) => {
  const tokenRequest = {
    code,
    scopes: [
      'User.Read',
      'OnlineMeetings.Read',
      'OnlineMeetings.ReadWrite',
      'Calendars.Read',
      'CallRecords.Read.All'
    ],
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3001/auth/callback',
  };

  return await msalClient.acquireTokenByCode(tokenRequest);
};

export const acquireTokenByClientCredentials = async () => {
  const clientCredentialRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  return await msalClient.acquireTokenByClientCredential(clientCredentialRequest);
};
