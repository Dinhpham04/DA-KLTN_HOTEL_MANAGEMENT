export class ReservationCreatedEvent {
  constructor(
    public readonly reserveId: number,
    public readonly clientId: number | null,
    public readonly roomId: number | null,
    public readonly periodFrom: Date | null,
    public readonly periodTo: Date | null,
  ) { }
}

export class ReservationConfirmedEvent {
  constructor(
    public readonly reserveId: number,
    public readonly confirmStaffId: number,
  ) { }
}

export class ReservationCheckedInEvent {
  constructor(
    public readonly reserveId: number,
    public readonly roomId: number | null,
    public readonly receptionistId: number,
  ) { }
}

export class ReservationCheckedOutEvent {
  constructor(
    public readonly reserveId: number,
    public readonly roomId: number | null,
    public readonly facilityId: number | null,
    public readonly clientId: number | null,
    public readonly receptionistId: number,
  ) { }
}

export class ReservationCancelledEvent {
  constructor(
    public readonly reserveId: number,
    public readonly roomId: number | null,
    public readonly cancelReason: string | undefined,
  ) { }
}
