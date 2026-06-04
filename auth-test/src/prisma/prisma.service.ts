import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async update({ model, operation, args, query }) {
        // take incoming `where` and set `age`
        const user = await prisma.user.findUnique({
          where: {
            id: args.where.id,
          },
        });

        if (!user) {
          console.log("user not found");
          return query(args);
        }

        const before = user.userStatus;
        const result = await query(args);
        const after = result.userStatus;

        if (before === "ACTIVE" && after === "DEACTIVATED") {
          await prisma.user.update({
            where: {
              id: args.where.id,
            },
            data: {
              isForceLogout: true,
            },
          });
        }

        return result;
      },
    },
  },
});

export default prisma;
