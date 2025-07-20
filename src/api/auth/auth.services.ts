import {
  getReservedUsernameInDB,
  insertReservedUsernameInDB,
  updateReservedUsernameInDB,
} from "../../repository/auth.repo";

export async function reserveUsernameService({
  username,
}: {
  username: string;
}) {
  const existing = await getReservedUsernameInDB({ username });
  if (existing) {
    if (!isExpired({ reservedAt: existing.reservedAt, ttlInMinutes: 30 })) {
      return {
        status: "unavailable",
        reason: "Username is currently reserved or taken.",
      };
    }
    const newToken = generateReservationToken();
    await updateReservedUsernameInDB({ username, reservationToken: newToken });
    return { status: "reserved", reservationToken: newToken };
  }

  const token = generateReservationToken();
  await insertReservedUsernameInDB({ username, reservationToken: token });
  return { status: "reserved", reservationToken: token };
}


const isExpired = ({
  reservedAt,
  ttlInMinutes,
}: {
  reservedAt: Date;
  ttlInMinutes: number;
}) => {
  const now = new Date();
  const expirationTime = new Date(
    reservedAt.getTime() + ttlInMinutes * 60 * 1000
  );
  return now > expirationTime;
};

const generateReservationToken = () => crypto.randomUUID();
