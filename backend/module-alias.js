const moduleAlias = require('module-alias');
const path = require('path');

// Register aliases
moduleAlias.addAliases({
  '@': path.join(__dirname, 'dist'),
  '@prisma/client': path.join(__dirname, 'node_modules/@prisma/client'),
});
