export type ReservedUsername = {
  username: string;
  reservedAt: Date;
  reservationToken: string;
};

export type ReservedUsernameDBResponse = ReservedUsername
