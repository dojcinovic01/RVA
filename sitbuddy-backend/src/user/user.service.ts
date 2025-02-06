import * as bcrypt from 'bcrypt';
import { ConflictException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import { ReviewService } from "src/review/review.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService,
  ) {}

  
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
  
      return await this.userRepository.save(user);
  
    } catch (error) {
      // ✅ Loguj nepoznate greške radi lakšeg debugovanja
      console.error('Greška prilikom kreiranja korisnika:', error);
  
      // ✅ Generička greška za ostale slučajeve
      throw new InternalServerErrorException('Došlo je do greške prilikom registracije. Pokušajte ponovo.');
    }
  }
  

  async getUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    console.log('Pronađeni korisnici:', users);
    return users;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } }); // Tražimo korisnika po email-u
    if (!user) {
      throw new NotFoundException(`Korisnik sa email-om ${email} nije pronađen.`);
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Korisnik sa id ${id} nije pronađen.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const hashedPassword = await bcrypt.hash(updateUserDto.password, 10); 
    return this.userRepository.save({ ...user, ...updateUserDto, password: hashedPassword });
  }

  async delete(id: number): Promise<string> {
    const user = await this.findById(id);
    this.userRepository.remove(user);
    return `Korisnik sa id ${id} je uspešno obrisan.`;
  }

  async updateProfilePicture(userId: number, filename: string): Promise<User> {
    const user = await this.findById(userId);
    user.profilePicture = filename;
    return this.userRepository.save(user);
  }

  async updateCriminalRecord(userId: number, filename: string): Promise<User> {
    const user = await this.findById(userId);
    user.criminalRecordProof = filename;
    return this.userRepository.save(user);
  }

  async calculateAverageRating(userId: number): Promise<number> {
    const reviews = await this.reviewService.findByReviewToId(userId);
    
    const ratings = reviews.map(review => review.rating);
    const average = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;
    
    return parseFloat(average.toFixed(2));
    
  }
  
  
}
