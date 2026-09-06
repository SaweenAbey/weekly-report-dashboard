import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectDocument> {
    const createdProject = new this.projectModel(createProjectDto);
    return (await createdProject.save()).populate(['manager', 'members']);
  }

  async findAll(
    paginationDto: PaginationDto,
    currentUser: UserDocument,
  ): Promise<PaginatedResult<ProjectDocument>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = paginationDto;

    const filter: Record<string, any> = {};

    // Role-based visibility:
    // ADMIN can see all projects
    // MANAGER can see projects they manage or are members of
    // TEAM_MEMBER can see projects they belong to
    if (currentUser.role === Role.MANAGER) {
      filter.$or = [
        { manager: currentUser._id },
        { members: currentUser._id },
      ];
    } else if (currentUser.role === Role.TEAM_MEMBER) {
      filter.members = currentUser._id;
    }

    if (search) {
      const searchCondition = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
        delete filter.$or;
      } else {
        filter.$or = searchCondition;
      }
    }

    const total = await this.projectModel.countDocuments(filter);
    const sort: Record<string, any> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const data = await this.projectModel
      .find(filter)
      .populate('manager', 'name email avatarUrl department')
      .populate('members', 'name email avatarUrl department role')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('manager', 'name email avatarUrl department')
      .populate('members', 'name email avatarUrl department role')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, { $set: updateProjectDto }, { new: true })
      .populate('manager', 'name email avatarUrl department')
      .populate('members', 'name email avatarUrl department role')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return updatedProject;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
