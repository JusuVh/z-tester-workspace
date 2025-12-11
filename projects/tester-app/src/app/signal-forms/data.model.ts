export interface Point {
  uuid: string;
  siteUuid: string;
  zoneUuid: string;
  usageUuid?: string;
  postalCode: string;
  generalInformation: Required<GeneralInformation>;
}

export interface GeneralInformation {
  name: string;
  externalIdentifier?: string;
  referenceIdentifier?: string;
  networkManager?: string;
  resource: Resource;
  quotationIdentifier?: string;
}

export type Resource = 'ELECTRICITY' | 'TEMP' | 'GAS';
