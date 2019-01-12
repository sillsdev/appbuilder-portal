export class RedeemOrganizationMembershipInviteError extends Error {
  meta?: any;
  text: string;

  constructor(text, meta = null) {
    super(text);
    this.meta = meta;
    this.text = text;
  }
}
