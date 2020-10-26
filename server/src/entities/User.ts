import { ObjectType, Field, Int } from "type-graphql"
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number

	@Field()
	@Column({ unique: true })
	email!: string

	@Column()
	password!: string

	@Field()
	@Column({ default: 0 })
	tokenVersion!: number

	@Field(() => String)
	@CreateDateColumn({ type: "date" })
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
