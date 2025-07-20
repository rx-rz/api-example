import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { reservedUsername } from "../db/schema";
import { ReservedUsernameDBResponse } from "../domain/reserved-username.domain";

export const getReservedUsernameInDB = async ({
  username,
}: {
  username: string;
}) => {
  const [data] = await db
    .select()
    .from(reservedUsername)
    .where(eq(reservedUsername.username, username))
    .limit(1);
  if (!data) return null;
  const record: ReservedUsernameDBResponse = {
    username: data.username,
    reservationToken: data.reservationToken,
    reservedAt: data.reservedAt,
  };
  return record;
};

export const insertReservedUsernameInDB = async ({
  username,
  reservationToken,
}: {
  username: string;
  reservationToken: string;
}) => {
  const [data] = await db
    .insert(reservedUsername)
    .values({
      username,
      reservationToken,
      reservedAt: new Date(),
    })
    .returning({ username: reservedUsername.username });
  if (!data) return null;
  const record: Partial<ReservedUsernameDBResponse> = {
    username: data.username,
  };
  return record;
};

export const updateReservedUsernameInDB = async ({
  username,
  reservationToken,
}: {
  username: string;
  reservationToken: string;
}) => {
  const [data] = await db
    .update(reservedUsername)
    .set({
      reservationToken,
      reservedAt: new Date(),
    })
    .where(eq(reservedUsername.username, username))
    .returning({
      username: reservedUsername.username,
      reservedAt: reservedUsername.reservedAt,
    });
  if (!data) return null;
  const record: Partial<ReservedUsernameDBResponse> = {
    username: data.username,
    reservedAt: data.reservedAt,
  };
  return record;
};
