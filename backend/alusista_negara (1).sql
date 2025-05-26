-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2025 at 03:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alusista_negara`
--

-- --------------------------------------------------------

--
-- Table structure for table `manufaktur`
--

CREATE TABLE `manufaktur` (
  `id_manufaktur` int(11) NOT NULL,
  `nama_manufaktur` varchar(255) DEFAULT NULL,
  `negara` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manufaktur`
--

INSERT INTO `manufaktur` (`id_manufaktur`, `nama_manufaktur`, `negara`) VALUES
(1, 'LockHeed martin', 'USA'),
(3, 'Sukhoi', 'Russia'),
(4, 'Chengdu', 'China'),
(5, 'Pindad', 'Indonesia');

-- --------------------------------------------------------

--
-- Table structure for table `munisi_pesawat`
--

CREATE TABLE `munisi_pesawat` (
  `id_munisi` int(11) NOT NULL,
  `id_manufaktur` int(11) DEFAULT NULL,
  `nama_munisi` varchar(255) DEFAULT NULL,
  `tipe_munisi` varchar(255) DEFAULT NULL,
  `stok_munisi` int(11) DEFAULT NULL,
  `tahun_munisi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `munisi_pesawat`
--

INSERT INTO `munisi_pesawat` (`id_munisi`, `id_manufaktur`, `nama_munisi`, `tipe_munisi`, `stok_munisi`, `tahun_munisi`) VALUES
(1, 1, 'AIM 120', 'AA mislle', 123, 2015),
(2, 4, 'PL 12', 'AA mislle', 123, 2016);

-- --------------------------------------------------------

--
-- Table structure for table `pesawat`
--

CREATE TABLE `pesawat` (
  `id_pesawat` int(11) NOT NULL,
  `id_munisi` int(11) DEFAULT NULL,
  `id_manufaktur` int(11) DEFAULT NULL,
  `nama_pesawat` varchar(255) DEFAULT NULL,
  `tipe_pesawat` varchar(255) DEFAULT NULL,
  `variant_pesawat` varchar(255) DEFAULT NULL,
  `jumlah_pesawat` int(11) DEFAULT NULL,
  `tahun_pesawat` int(11) DEFAULT NULL,
  `gambar_url` varchar(2048) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pesawat`
--

INSERT INTO `pesawat` (`id_pesawat`, `id_munisi`, `id_manufaktur`, `nama_pesawat`, `tipe_pesawat`, `variant_pesawat`, `jumlah_pesawat`, `tahun_pesawat`, `gambar_url`) VALUES
(1, 1, 4, 'Mig 29', 'Jet Fighter', 'E', 12, 1998, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `nama_user` varchar(255) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `nama_user`, `jabatan`, `email`, `password`) VALUES
(1, 'Test User', 'Developer', 'test@example.com', '$2b$10$kD9cxyPZC//dOPqaDvb19ue.7kvSuqY/MH6rQg45KaD.83gfsmLle'),
(2, 'halo dunia', 'kolonel', 'halo@gmail.com', '$2b$10$h7P3nlfcurr6c.KmrRBl9eyxY9pDrOr5pDfjcA9wob5kSQrwh0icO');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `manufaktur`
--
ALTER TABLE `manufaktur`
  ADD PRIMARY KEY (`id_manufaktur`);

--
-- Indexes for table `munisi_pesawat`
--
ALTER TABLE `munisi_pesawat`
  ADD PRIMARY KEY (`id_munisi`),
  ADD KEY `id_manufaktur` (`id_manufaktur`);

--
-- Indexes for table `pesawat`
--
ALTER TABLE `pesawat`
  ADD PRIMARY KEY (`id_pesawat`),
  ADD KEY `id_munisi` (`id_munisi`),
  ADD KEY `id_manufaktur` (`id_manufaktur`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `manufaktur`
--
ALTER TABLE `manufaktur`
  MODIFY `id_manufaktur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `munisi_pesawat`
--
ALTER TABLE `munisi_pesawat`
  MODIFY `id_munisi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pesawat`
--
ALTER TABLE `pesawat`
  MODIFY `id_pesawat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `munisi_pesawat`
--
ALTER TABLE `munisi_pesawat`
  ADD CONSTRAINT `munisi_pesawat_ibfk_1` FOREIGN KEY (`id_manufaktur`) REFERENCES `manufaktur` (`id_manufaktur`);

--
-- Constraints for table `pesawat`
--
ALTER TABLE `pesawat`
  ADD CONSTRAINT `pesawat_ibfk_1` FOREIGN KEY (`id_munisi`) REFERENCES `munisi_pesawat` (`id_munisi`),
  ADD CONSTRAINT `pesawat_ibfk_2` FOREIGN KEY (`id_manufaktur`) REFERENCES `manufaktur` (`id_manufaktur`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
