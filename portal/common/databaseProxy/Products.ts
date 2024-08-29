import prisma from '../prisma.js';

function deleteProduct(productId: string) {
  // Delete all userTasks for this product, and delete the product
  return prisma.$transaction([
    prisma.userTasks.deleteMany({
      where: {
        ProductId: productId
      }
    }),
    prisma.products.delete({
      where: {
        Id: productId
      }
    })
  ]);
}
export { deleteProduct as delete };
