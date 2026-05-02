import { BarberModel } from './model';
export declare abstract class BarberService {
    private static requireOwner;
    private static normalizeEmail;
    private static normalizePhone;
    private static findUserByInviteTarget;
    private static ensureNoPendingInvitation;
    private static ensureNotActiveMember;
    private static toBarberListItem;
    static bulkInviteBarbers(organizationId: string, userId: string, input: BarberModel.BulkInviteInput): Promise<BarberModel.BulkInviteResponse>;
    static inviteBarber(organizationId: string, userId: string, input: BarberModel.BarberInviteInput): Promise<BarberModel.BarberInviteResponse>;
    static listBarbers(organizationId: string, search?: string): Promise<BarberModel.BarberListItem[]>;
    static cancelInvitation(organizationId: string, userId: string, invitationId: string): Promise<BarberModel.CancelInviteResponse>;
    static removeBarber(organizationId: string, userId: string, memberId: string): Promise<BarberModel.BarberRemoveResponse>;
    static acceptInvitation(userId: string, invitationId: string): Promise<BarberModel.InvitationActionResponse>;
    static declineInvitation(userId: string, invitationId: string): Promise<BarberModel.InvitationActionResponse>;
}
