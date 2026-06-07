const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Monthly Attendance Matrix - PDF Format
 * Creates a date-wise attendance matrix with color coding
 */
const generateMonthlyAttendanceMatrixPDF = async (attendanceData, month, year, holidays = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pool = require('../config/database');
      
      // Fetch holidays for the month
      const holidaysResult = await pool.query(
        `SELECT * FROM holidays 
         WHERE EXTRACT(MONTH FROM holiday_date) = $1 
         AND EXTRACT(YEAR FROM holiday_date) = $2 
         AND is_enabled = true`,
        [month, year]
      );
      
      const holidayMap = {};
      holidaysResult.rows.forEach(h => {
        const day = new Date(h.holiday_date).getDate();
        holidayMap[day] = h;
      });

      const doc = new PDFDocument({ 
        size: 'A3', 
        layout: 'landscape',
        margin: 20
      });

      const fileName = `attendance_matrix_${month}_${year}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../temp', fileName);

      // Create temp directory if not exists
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Get days in month and current date
      const daysInMonth = new Date(year, month, 0).getDate();
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      
      // Determine max day to show (only up to current date if it's current month)
      let maxDay = daysInMonth;
      if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
        maxDay = currentDay;
      }
      
      // Organize data by employee
      const employeeMap = {};
      attendanceData.forEach(record => {
        const empId = record.employee_id;
        if (!employeeMap[empId]) {
          employeeMap[empId] = {
            id: empId,
            name: record.name,
            department: record.department,
            attendance: {}
          };
        }
        
        // Only add attendance if there's actual attendance data
        if (record.attendance_date) {
          const day = new Date(record.attendance_date).getDate();
          // Only include if within valid range
          if (day <= maxDay) {
            employeeMap[empId].attendance[day] = getAttendanceCodeFromDB(record);
          }
        }
      });

      const employees = Object.values(employeeMap);

      // Header
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Monthly Attendance Matrix', { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Month: ${getMonthName(month)} ${year}`, { align: 'center' })
         .moveDown();

      // Legend
      drawLegend(doc);
      doc.moveDown();

      // Calculate dimensions
      const startX = 20;
      const startY = 140;
      const nameColWidth = 120;
      const dateColWidth = 18;
      const rowHeight = 20;

      // Draw table header
      let currentY = startY;
      
      // Header background
      doc.rect(startX, currentY, nameColWidth + (daysInMonth * dateColWidth), rowHeight)
         .fill('#1F2937');

      // Employee Name header
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#FFFFFF')
         .text('Employee Name', startX + 5, currentY + 6, { width: nameColWidth - 10 });

      // Date headers (1 to maxDay only)
      for (let day = 1; day <= maxDay; day++) {
        const x = startX + nameColWidth + ((day - 1) * dateColWidth);
        doc.text(day.toString(), x + 3, currentY + 6, { width: dateColWidth - 6, align: 'center' });
      }

      currentY += rowHeight;

      // Draw employee rows
      employees.forEach((employee, index) => {
        // Check if need new page
        if (currentY > 550) {
          doc.addPage({ size: 'A3', layout: 'landscape', margin: 20 });
          currentY = 50;
          
          // Redraw header on new page
          doc.rect(startX, currentY, nameColWidth + (daysInMonth * dateColWidth), rowHeight)
             .fill('#1F2937');
          doc.fontSize(8)
             .font('Helvetica-Bold')
             .fillColor('#FFFFFF')
             .text('Employee Name', startX + 5, currentY + 6, { width: nameColWidth - 10 });
          for (let day = 1; day <= daysInMonth; day++) {
            const x = startX + nameColWidth + ((day - 1) * dateColWidth);
            doc.text(day.toString(), x + 3, currentY + 6, { width: dateColWidth - 6, align: 'center' });
          }
          currentY += rowHeight;
        }

        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(startX, currentY, nameColWidth + (daysInMonth * dateColWidth), rowHeight)
             .fill('#F9FAFB');
        }

        // Employee name
        doc.fontSize(7)
           .font('Helvetica')
           .fillColor('#000000')
           .text(employee.name, startX + 5, currentY + 6, { width: nameColWidth - 10 });

        // Draw attendance cells
        for (let day = 1; day <= maxDay; day++) {
          const x = startX + nameColWidth + ((day - 1) * dateColWidth);
          const attendanceCode = employee.attendance[day] || null;
          
          // Get cell info (Sunday > Holiday > Attendance)
          const cellInfo = getDateCellInfo(day, parseInt(year), parseInt(month), holidayMap, attendanceCode);

          if (cellInfo.type !== 'empty') {
            const color = getStatusColor(cellInfo.code);

            // Cell background
            doc.rect(x, currentY, dateColWidth, rowHeight)
               .fill(color);

            // Determine display text (shorten for holidays)
            let displayText = cellInfo.text;
            let fontSize = 7;
            
            if (cellInfo.type === 'sunday') {
              displayText = 'Sun';
              fontSize = 6;
            } else if (cellInfo.type === 'holiday') {
              displayText = cellInfo.holidayType === 'Government Holiday' ? 'GovH' : 'OffH';
              fontSize = 5;
            }
            
            // Draw horizontal text for all types
            doc.fontSize(fontSize)
               .font('Helvetica-Bold')
               .fillColor(cellInfo.code === 'P' ? '#FFFFFF' : '#000000')
               .text(displayText, x + 1, currentY + 6, { 
                 width: dateColWidth - 2, 
                 align: 'center' 
               });
          } else {
            // Leave cell blank (with light gray border)
            doc.rect(x, currentY, dateColWidth, rowHeight)
               .stroke('#E5E7EB');
          }
        }

        currentY += rowHeight;
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor('#6B7280')
           .text(
             `Page ${i + 1} of ${pageCount} | Generated on: ${new Date().toLocaleString()} | Showing dates 1-${maxDay}`,
             20,
             doc.page.height - 30,
             { align: 'center' }
           );
      }

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Monthly Attendance Matrix - Excel Format
 */
const generateMonthlyAttendanceMatrixExcel = async (attendanceData, month, year) => {
  try {
    const pool = require('../config/database');
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Matrix');

    // Fetch holidays for the month
    const holidaysResult = await pool.query(
      `SELECT * FROM holidays 
       WHERE EXTRACT(MONTH FROM holiday_date) = $1 
       AND EXTRACT(YEAR FROM holiday_date) = $2 
       AND is_enabled = true`,
      [month, year]
    );
    
    const holidayMap = {};
    holidaysResult.rows.forEach(h => {
      const day = new Date(h.holiday_date).getDate();
      holidayMap[day] = h;
    });

    // Get days in month and current date
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // Determine max day to show
    let maxDay = daysInMonth;
    if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
      maxDay = currentDay;
    }

    // Organize data by employee
    const employeeMap = {};
    attendanceData.forEach(record => {
      const empId = record.employee_id;
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          id: empId,
          name: record.name,
          department: record.department,
          attendance: {}
        };
      }
      
      // Only add attendance if there's actual attendance data
      if (record.attendance_date) {
        const day = new Date(record.attendance_date).getDate();
        // Only include if within valid range
        if (day <= maxDay) {
          employeeMap[empId].attendance[day] = {
            code: getAttendanceCodeFromDB(record),
            record: record
          };
        }
      }
    });

    const employees = Object.values(employeeMap);

    // Configure worksheet properties for cleaner look
    worksheet.properties.defaultRowHeight = 18;

    // Title
    worksheet.mergeCells('A1', `${String.fromCharCode(65 + maxDay)}1`);
    worksheet.getCell('A1').value = 'Monthly Attendance Matrix';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Subtitle
    worksheet.mergeCells('A2', `${String.fromCharCode(65 + maxDay)}2`);
    worksheet.getCell('A2').value = `${getMonthName(month)} ${year} (Showing dates 1-${maxDay})`;
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

    // Legend
    worksheet.mergeCells('A3', `${String.fromCharCode(65 + maxDay)}3`);
    worksheet.getCell('A3').value = 'Legend: P = Present (Green) | Late = Late (Yellow) | HD = Half Day (Blue) | A = Absent (Red) | Sun = Sunday (Gray) | GovH = Government Holiday (Orange) | OffH = Office Holiday (Purple)';
    worksheet.getCell('A3').font = { size: 10, italic: true };
    worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(3).height = 20;

    // Header row
    const headerRow = worksheet.getRow(5);
    headerRow.getCell(1).value = 'Employee Name';
    headerRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    headerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.getCell(1).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Date headers (1 to maxDay only)
    for (let day = 1; day <= maxDay; day++) {
      const cell = headerRow.getCell(day + 1);
      cell.value = day;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    headerRow.height = 20;

    // Employee rows
    employees.forEach((employee, index) => {
      const row = worksheet.getRow(6 + index);
      
      // Employee name
      const nameCell = row.getCell(1);
      nameCell.value = employee.name;
      nameCell.alignment = { horizontal: 'left', vertical: 'middle' };
      nameCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Attendance cells (1 to maxDay only)
      for (let day = 1; day <= maxDay; day++) {
        const cell = row.getCell(day + 1);
        const attendanceCode = employee.attendance[day]?.code || null;
        
        // Get cell info (Sunday > Holiday > Attendance)
        const cellInfo = getDateCellInfo(day, parseInt(year), parseInt(month), holidayMap, attendanceCode);
        
        if (cellInfo.type !== 'empty') {
          // Determine display text (shortened for readability)
          let displayText = cellInfo.text;
          
          if (cellInfo.type === 'sunday') {
            displayText = 'Sun';
          } else if (cellInfo.type === 'holiday') {
            displayText = cellInfo.holidayType === 'Government Holiday' ? 'GovH' : 'OffH';
          }
          
          cell.value = displayText;
          cell.font = { bold: true, size: cellInfo.type === 'attendance' ? 9 : 7 };
          
          // Horizontal text for all (no rotation)
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle'
          };
          
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: getExcelStatusColor(cellInfo.code) }
          };
          
          // Add holiday note as comment if exists
          if (cellInfo.type === 'holiday' && cellInfo.note) {
            cell.note = {
              texts: [
                { 
                  font: { bold: true, size: 10, name: 'Calibri' },
                  text: `${cellInfo.title}\n\n`
                },
                {
                  font: { size: 9, name: 'Calibri' },
                  text: cellInfo.note
                }
              ],
              margins: {
                insetmode: 'custom',
                inset: [0.25, 0.25, 0.35, 0.35]
              }
            };
          }
        } else {
          // Leave blank with just border
          cell.value = '';
        }
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }

      row.height = 18;
    });

    // Hide all columns after maxDay + 1 (to remove blank space)
    const lastColumn = maxDay + 1;
    const maxExcelColumns = 100; // Hide up to column 100
    for (let col = lastColumn + 1; col <= maxExcelColumns; col++) {
      worksheet.getColumn(col).hidden = true;
    }

    // Set print area (only includes actual data)
    const lastRow = 6 + employees.length - 1;
    const lastColLetter = String.fromCharCode(65 + maxDay); // Convert to Excel column letter
    worksheet.pageSetup.printArea = `A1:${lastColLetter}${lastRow}`;

    // Configure page setup for printing
    worksheet.pageSetup.paperSize = 9; // A4
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0; // As many pages as needed vertically

    // Auto-fit the Employee Name column based on content
    let maxNameLength = 15; // minimum width
    employees.forEach(emp => {
      if (emp.name && emp.name.length > maxNameLength) {
        maxNameLength = Math.min(emp.name.length, 35); // max 35 chars
      }
    });
    worksheet.getColumn(1).width = maxNameLength;

    // Ensure date columns are properly sized
    for (let day = 1; day <= maxDay; day++) {
      worksheet.getColumn(day + 1).width = 5;
    }

    // Define worksheet dimensions and freeze panes
    const lastCol = maxDay + 1;
    
    // Set worksheet dimensions explicitly
    worksheet.lastRow = worksheet.getRow(lastRow);
    worksheet.lastColumn = worksheet.getColumn(lastCol);
    
    // Configure freeze panes (only Employee Name column and header rows)
    // This prevents duplicate appearing when scrolling
    worksheet.views = [
      { 
        state: 'frozen', 
        xSplit: 1,  // Freeze column A (Employee Name)
        ySplit: 5,  // Freeze rows 1-5 (Title, Legend, Headers)
        topLeftCell: 'B6', // Start scrolling from B6
        activeCell: 'A1'
      }
    ];

    // Save file
    const fileName = `attendance_matrix_${month}_${year}_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, '../temp', fileName);
    
    await workbook.xlsx.writeFile(filePath);

    return { filePath, fileName };

  } catch (error) {
    throw error;
  }
};

// Helper functions
function getAttendanceCodeFromDB(record) {
  // Only return status if there's actual attendance data from database
  if (!record.login_time && record.attendance_status === 'Absent') {
    // True absent (has explicit absent record in DB)
    return 'A';
  }
  
  if (!record.login_time) {
    // No data - should not happen, but return null to leave blank
    return null;
  }
  
  const status = record.attendance_status;
  
  if (status === 'Late') return 'Late';
  if (status === 'Half Day') return 'HD';
  if (status === 'Present' || status === 'Work From Home') return 'P';
  if (status === 'Absent') return 'A';
  
  return null;
}

function getStatusColor(code) {
  const colors = {
    'P': '#10B981',      // Green
    'Late': '#FCD34D',   // Yellow
    'HD': '#60A5FA',     // Blue
    'A': '#EF4444',      // Red
    'Sunday': '#9CA3AF', // Gray
    'Government Holiday': '#F97316',  // Orange
    'Office Holiday': '#8B5CF6'  // Purple
  };
  return colors[code] || '#E5E7EB';
}

function getExcelStatusColor(code) {
  const colors = {
    'P': 'FF10B981',      // Green
    'Late': 'FFFCD34D',   // Yellow
    'HD': 'FF60A5FA',     // Blue
    'A': 'FFEF4444',      // Red
    'Sunday': 'FF9CA3AF', // Gray
    'Government Holiday': 'FFF97316',  // Orange
    'Office Holiday': 'FF8B5CF6'  // Purple
  };
  return colors[code] || 'FFE5E7EB';
}

// Check if date is Sunday
function isSunday(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getDay() === 0;
}

// Get holiday info for a specific date
function getHolidayForDate(day, holidayMap) {
  return holidayMap[day] || null;
}

// Get display text for date cell (handles Sunday/Holiday/Attendance)
function getDateCellInfo(day, year, month, holidayMap, attendanceCode) {
  // Priority: Sunday > Holiday > Attendance
  
  // Check Sunday
  if (isSunday(year, month, day)) {
    return {
      text: 'Sunday',
      code: 'Sunday',
      type: 'sunday'
    };
  }
  
  // Check Holiday
  const holiday = getHolidayForDate(day, holidayMap);
  if (holiday) {
    return {
      text: holiday.holiday_type,
      code: holiday.holiday_type,
      type: 'holiday',
      holidayType: holiday.holiday_type,
      title: holiday.holiday_title,
      note: holiday.holiday_note
    };
  }
  
  // Return attendance code
  if (attendanceCode) {
    return {
      text: attendanceCode,
      code: attendanceCode,
      type: 'attendance'
    };
  }
  
  // No data
  return {
    text: '',
    code: null,
    type: 'empty'
  };
}

function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

function drawLegend(doc) {
  const startX = 50;
  const startY = 100;
  const boxSize = 12;
  const spacing = 90;

  // Present
  doc.rect(startX, startY, boxSize, boxSize).fill('#10B981');
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
     .text('P = Present', startX + boxSize + 5, startY + 2);

  // Late
  doc.rect(startX + spacing, startY, boxSize, boxSize).fill('#FCD34D');
  doc.text('Late', startX + spacing + boxSize + 5, startY + 2);

  // Half Day
  doc.rect(startX + (spacing * 2), startY, boxSize, boxSize).fill('#60A5FA');
  doc.text('HD = Half Day', startX + (spacing * 2) + boxSize + 5, startY + 2);

  // Absent
  doc.rect(startX + (spacing * 3), startY, boxSize, boxSize).fill('#EF4444');
  doc.text('A = Absent', startX + (spacing * 3) + boxSize + 5, startY + 2);

  // Row 2
  const startY2 = startY + 18;
  
  // Sunday
  doc.rect(startX, startY2, boxSize, boxSize).fill('#9CA3AF');
  doc.text('Sun = Sunday', startX + boxSize + 5, startY2 + 2);

  // Government Holiday
  doc.rect(startX + spacing, startY2, boxSize, boxSize).fill('#F97316');
  doc.text('GovH = Gov Holiday', startX + spacing + boxSize + 5, startY2 + 2);

  // Office Holiday
  doc.rect(startX + (spacing * 2), startY2, boxSize, boxSize).fill('#8B5CF6');
  doc.text('OffH = Office Holiday', startX + (spacing * 2) + boxSize + 5, startY2 + 2);

  // Note about blanks
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#6B7280')
     .text('(Blank cells = No record)', startX, startY2 + 20);
}

module.exports = {
  generateMonthlyAttendanceMatrixPDF,
  generateMonthlyAttendanceMatrixExcel
};
