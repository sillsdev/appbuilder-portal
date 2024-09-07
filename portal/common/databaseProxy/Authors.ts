import prisma from '../prisma.js';

export function deleteAuthor(authorId: number) {
  return prisma.authors.delete({
    where: {
      Id: authorId
    }
  });
}
