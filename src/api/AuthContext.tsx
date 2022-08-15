import { CognitoUser } from 'amazon-cognito-identity-js';
import React from 'react';

export type ExtendedCognitoUser = CognitoUser & {
  attributes: Record<string, any>;
};
interface AuthContextType {
  accessToken?: string;
  idToken?: string;
  user?: ExtendedCognitoUser;
  recheckAuth(): void;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);
