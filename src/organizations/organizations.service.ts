import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { User } from '../user/entities/user.entity.js';
import { OrganizationMember } from './entities/organization-member.entity.js';
import { OrganizationRole } from './enums/organization-role.enum.js';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import OutboxService from '../infrastructure/outbox/outbox.service.js';
import { AuthorizationService } from '../auth/authorization/authorization.service.js';
import { Permission } from '../auth/enums/permissions.enum.js';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationMember)
        private readonly organizationMemberRepository: Repository<OrganizationMember>,

        @InjectDataSource()
        private readonly dataSource: DataSource,

        private readonly outboxService: OutboxService,
        private readonly authorizationService: AuthorizationService,
    ){}

    async createOrganization(
        userId: number,
        createOrganizationDto: CreateOrganizationDto
    ): Promise<Organization>{
        return this.dataSource.transaction(
            async (manager) => {
                const user = await manager.findOne(User, {
                    where: {id: userId}
                });

                if (!user) {
                    throw new NotFoundException(`User with id ${userId} not found`);
                }

                const organization = manager.create(Organization, {
                    name: createOrganizationDto.name,
                    slug: createOrganizationDto.slug
                });

                
                
                const savedOrganization = await manager.save(organization);

                const occuredAt = new Date();


                await this.outboxService.create(
                    {
                        type: 'organization.member.added',
                        payload: {
                            organizationId: savedOrganization.id,
                            actorUserId: userId,
                            memberUserId: user.id,
                            role: OrganizationRole.OWNER,
                            occuredAt,
                        },
                        occuredAt,
                    },
                    manager,
                    
                );

                const memberShip = manager.create(OrganizationMember, {
                    user: user,
                    organization: savedOrganization,
                    role: OrganizationRole.OWNER
                });
                await manager.save(memberShip);


                await this.outboxService.create(
                    {
                        type: 'organization.created',
                        payload: {
                            organizationId: savedOrganization.id,
                            actorUserId: userId,
                            name: savedOrganization.name,
                            slug: savedOrganization.slug,
                            occuredAt,
                        },
                        occuredAt,
                    },
                    manager,
                );
                return savedOrganization;
            },
        );
    }

    async changeMemberRole(
        actorUserId: number,
        organizationId: number,
        memberUserId: number,
        newRole: OrganizationRole
    ): Promise<OrganizationMember> {
        const allowed = await this.authorizationService.hasPermission(
            actorUserId,
            organizationId,
            Permission.MEMBER_UPDATE_ROLE
        );

        if (!allowed) {
            throw new ForbiddenException('You are not allowed to change the role of this member');
        }

        const membership = await this.organizationMemberRepository.findOne({
            where: {
                organization: { id: organizationId },
                user: { id: memberUserId }
            },
        });


        if (!membership) {
            throw new NotFoundException(`Member with id ${memberUserId} not found in organization with id ${organizationId}`);
        }


        if (membership.role === newRole) {
            return membership;
        }

        const oldRole = membership.role;
        const occuredAt = new Date();

        return this.dataSource.transaction(
            async (manager) => {
                membership.role = newRole;

                const savedMembership = await manager.getRepository(OrganizationMember).save(membership);

                await this.outboxService.create(
                    {
                        type: 'organization.member.role.changed',
                        payload: {
                            organizationId: organizationId,
                            actorUserId: actorUserId,
                            memberUserId: memberUserId,
                            oldRole: oldRole,
                            newRole: newRole,
                            occuredAt,
                        },
                        occuredAt,
                    },
                    manager,
                );

                return savedMembership;
            }
        )
    }

    async addMember(
        actorUserId: number,
        organizationId: number,
        memberUserId: number,
        role: OrganizationRole
    ): Promise<OrganizationMember> {
        const allowed = await this.authorizationService.hasPermission(
            actorUserId,
            organizationId,
            Permission.MEMBER_INVITE
        );

        if (!allowed) {
            throw new ForbiddenException('You are not allowed to add members to this organization');
        }

        const user = await this.dataSource.getRepository(User).findOne({
            where: {
                id: memberUserId
            },
        });

        if (!user) {
            throw new NotFoundException(`User with id ${memberUserId} not found`);
        }

        const existingMembership = await this.organizationMemberRepository.findOne({
            where: {
                organization: { id: organizationId },
                user: { id: memberUserId }
            },
        });
        
        if (existingMembership) {
            throw new ConflictException(`User with id ${memberUserId} is already a member of the organization`);
        }
        
        const occuredAt = new Date();

        return this.dataSource.transaction(
            async (manager) => {
                const membership = manager.getRepository(OrganizationMember).create({
                    user,
                    organization: { id: organizationId },
                    role,
                });

                const savedMembership = await manager.getRepository(OrganizationMember).save(membership);

                await this.outboxService.create(
                    {
                        type: 'organization.member.added',
                        payload: {
                            organizationId: organizationId,
                            actorUserId: actorUserId,
                            memberUserId: memberUserId,
                            role: role,
                            occuredAt,
                        },
                        occuredAt,
                    },
                    manager,
                );

                return savedMembership;
            }
        )
    }
 
    
}
