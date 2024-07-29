-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `nidn` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `jk` ENUM('laki_laki', 'perempuan') NOT NULL,
    `phone` VARCHAR(16) NOT NULL,
    `alamat` VARCHAR(100) NOT NULL,
    `idRfid` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_idRfid_key`(`idRfid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NOT NULL,
    `status` ENUM('masuk', 'keluar') NOT NULL,
    `idRfid` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Presensi` ADD CONSTRAINT `Presensi_idRfid_fkey` FOREIGN KEY (`idRfid`) REFERENCES `User`(`idRfid`) ON DELETE RESTRICT ON UPDATE CASCADE;
