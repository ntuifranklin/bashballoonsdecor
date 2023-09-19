-- Create the database
CREATE DATABASE PartyRentalDB;
USE PartyRentalDB;

-- Create table for Party Items
CREATE TABLE PartyItems (
    ItemID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    RentalPrice DECIMAL(10, 2) NOT NULL,
    InStock INT NOT NULL,
    Category VARCHAR(50) NOT NULL
);

-- Create table for Customers
CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15) NOT NULL
);

-- Create table for Rentals
CREATE TABLE Rentals (
    RentalID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    RentalDate DATE NOT NULL,
    ReturnDate DATE,
    TotalCost DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('Square', 'PayPal', 'Stripe') NOT NULL,
    TransactionID VARCHAR(255), -- Store the payment transaction ID
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Create table for Rental Items
CREATE TABLE RentalItems (
    RentalItemID INT AUTO_INCREMENT PRIMARY KEY,
    RentalID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    RentalPrice DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID),
    FOREIGN KEY (ItemID) REFERENCES PartyItems(ItemID)
);

-- Create table for Financial Transactions
CREATE TABLE FinancialTransactions (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    RentalID INT NOT NULL,
    TransactionDate DATE NOT NULL,
    TransactionType ENUM('Payment', 'Return', 'DownPayment', 'Other') NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Description TEXT,
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);
