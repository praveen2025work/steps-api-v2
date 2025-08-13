import type { NextApiRequest, NextApiResponse } from 'next';
import { UserInfo } from '@/types/user-types';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserInfo>
) {
  res.status(200).json({
    samAccountName: "user123",
    description: "Lastname, Firstname: Department (Location)",
    displayName: "Lastname, Firstname : Role (Location)",
    distinguishedName: "CN=Lastname\\, Firstname: Department (Location),OU=Users,OU=LOC,OU=REGION,OU=ORG,DC=DOMAIN,DC=COMPANY,DC=com",
    emailAddress: "firstname.lastname@company.com",
    employeeId: "XXXXXXX",
    name: "Lastname, Firstname: Department (Location)",
    givenName: "Firstname",
    middleName: null,
    surname: "Lastname",
    domain: null,
    userName: "user123"
  });
}