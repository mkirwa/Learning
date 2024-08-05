package com.inn.cafe.serviceImpl;

import ch.qos.logback.core.encoder.EchoEncoder;
import com.fasterxml.jackson.databind.ser.Serializers;
import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.POJO.Bill;
import com.inn.cafe.constants.CafeConstants;
import com.inn.cafe.dao.BillDao;
import com.inn.cafe.service.BillService;
import com.inn.cafe.utils.CafeUtils;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.io.IOUtils;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Slf4j
@Data
@Service
public class BillServiceImpl implements BillService {
    @Autowired
    JwtFilter jwtFilter;

    @Autowired
    BillDao billDao;
    /**
     * @param requestMap
     * @return
     */
    @Override
    public ResponseEntity<String> generateReport(Map<String, Object> requestMap) {
        log.info("INSIDE GENERATE REPORT");
        try {
            // validate the sequence
            // Generate filename to uniquely identify any pdf
            String fileName;
            if (validateRequestMap(requestMap)){
                if(requestMap.containsKey("isGenerate") && !(Boolean) requestMap.get("isGenerate")){
                    //If the data is already in the database, pass the uuid
                    // from the request map.
                    // It also passes value from isGenerate into the filename
                    fileName = (String) requestMap.get("uuid");
                } else {
                    // Generate a unique name / id
                    fileName = CafeUtils.getUUID();
                    requestMap.put("uuid", fileName);
                    insertBill(requestMap);
                }

                String data = "Name: " + requestMap.get("name") + "\n" + "Contact Number: " + requestMap.get("contactNumber") +
                        "\n" + "Email: " + requestMap.get("email") + "\n" + "Payment Method: " + requestMap.get("paymentMethod");

                Document document = new Document();
                PdfWriter.getInstance(document, new FileOutputStream(CafeConstants.STORE_LOCATION+"//"+fileName+".pdf"));
                document.open();
                setRectangleInPdf(document);

                // placing the header into the document
                Paragraph chunk = new Paragraph("Cafe Management System", getFont("Header"));
                chunk.setAlignment(Element.ALIGN_CENTER);
                document.add(chunk);

                // Adding a paragraph
                Paragraph paragraph = new Paragraph(data + "\n \n ", getFont("Data"));
                document.add(paragraph);

                // Setting columns for the table. We are setting the columns to 5
                PdfPTable table = new PdfPTable(5);
                // Adding header to the tables
                addTableHeader(table);
                // Adding data to the table
                JSONArray jsonArray = CafeUtils.getJsonArrayFromString((String) requestMap.get("productDetails"));

                // Loop to add rows into data tables
                for(int i = 0; i <jsonArray.length(); i++){
                    addRows(table, CafeUtils.getMapFromJson(jsonArray.getString(i)));
                }
                document.add(table);

                Paragraph footer = new Paragraph("Total: "+requestMap.get("totalAmount")+"\n"
                + "Thank you for visiting. Please visit again!!", getFont("Data"));

                document.add(footer);
                document.close();

                return new ResponseEntity<>("{\"uuid\":\"" + fileName + "\"}", HttpStatus.OK);

            } else {
                return CafeUtils.getResponseEntity("Required data not found.", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }



    private void addRows(PdfPTable table, Map<String, Object> data) {
        log.info("Inside addRows");
        table.addCell((String) data.get("name"));
        table.addCell((String) data.get("category"));
        table.addCell((String) data.get("quantity"));
        table.addCell(Double.toString((Double)data.get("price")));
        table.addCell(Double.toString((Double)data.get("total")));
    }

    private void addTableHeader(PdfPTable table) {
        log.info("Inside addTableHeader");
        Stream.of("Name", "Category", "Quantity","Price","Sub Total")
                // This loops and creates the respective columns from Name to Category to Quantity e.t.c.
                .forEach(columnTitle->{
                    PdfPCell header = new PdfPCell();
                    header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                    header.setBorderWidth(2);
                    header.setPhrase(new Phrase(columnTitle));
                    header.setBackgroundColor(BaseColor.YELLOW);
                    header.setHorizontalAlignment(Element.ALIGN_CENTER);
                    header.setVerticalAlignment(Element.ALIGN_CENTER);
                    table.addCell(header);
                });
    }

    private Font getFont(String type) {
        log.info("Inside getFont");
        switch (type){
            case "Header":
                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLDOBLIQUE, 18, BaseColor.BLACK);
                headerFont.setStyle(Font.BOLD);
                return headerFont;
            case "Data":
                Font dataFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 11, BaseColor.BLACK);
                dataFont.setStyle(Font.BOLD);
                return dataFont;
            default:
                return new Font();
        }
    }

    private void setRectangleInPdf(Document document) throws DocumentException {
        log.info("Inside setRectangleInPdf");
        Rectangle rect = new Rectangle(577,825,18,15);
        rect.enableBorderSide(1);
        rect.enableBorderSide(2);
        rect.enableBorderSide(4);
        rect.enableBorderSide(8);
        rect.setBorderColor(BaseColor.BLACK);
        rect.setBorderWidth(1);
        document.add(rect);
    }

    private void insertBill(Map<String, Object> requestMap) {
        try {
            Bill bill = new Bill();
            bill.setUuid((String) requestMap.get("uuid"));
            bill.setName((String) requestMap.get("name"));
            bill.setEmail((String) requestMap.get("email"));
            bill.setContactNumber((String) requestMap.get("contactNumber"));
            bill.setPaymentMethod((String) requestMap.get("paymentMethod"));
            bill.setTotal(Integer.parseInt((String) requestMap.get("totalAmount")));
            bill.setProductDetails((String) requestMap.get("productDetails"));
            bill.setCreatedBy(jwtFilter.getCurrentUser());
            billDao.save(bill);
        } catch (Exception ex){
            ex.printStackTrace();
        }
    }

    private boolean validateRequestMap(Map<String, Object> requestMap) {
        return requestMap.containsKey("name")&&
                requestMap.containsKey("contactNumber") &&
                requestMap.containsKey("email") &&
                requestMap.containsKey("paymentMethod") &&
                requestMap.containsKey("productDetails") &&
                requestMap.containsKey("totalAmount");
    }

    /**
     * @return
     */
    @Override
    public ResponseEntity<List<Bill>> getBills() {
        List<Bill> list = new ArrayList<>();
        if(jwtFilter.isAdmin()){
            // if the user is an admin, return all bills
            list = billDao.getAllBills();
        } else {
            // if the user is not an admin, just return bills for that particular user alone.
            list = billDao.getBillsByUserName(jwtFilter.getCurrentUser());
        }
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    /**
     * @param requestMap
     * @return
     */
    @Override
    public ResponseEntity<byte[]> getPdf(Map<String, Object> requestMap) {
        log.info("Inside getPdf : requestMap {}", requestMap);
        try {
            // Generating 1 byte array
            byte[] byteArray = new byte[0];
            // Check for uuid. We are not going to generate a new uuid. We are only retrieving it.
            // Validate the request map too.
            if(!requestMap.containsKey("uuid") && validateRequestMap(requestMap)){
                return new ResponseEntity<>(byteArray, HttpStatus.BAD_REQUEST);
            }
            String filePath = CafeConstants.STORE_LOCATION + "\\" + (String) requestMap.get("uuid") + ".pdf";
            if(CafeUtils.isFileExist(filePath)){
                byteArray = getByteArray(filePath);
                return new ResponseEntity<>(byteArray, HttpStatus.OK);
            } else {
                requestMap.put("isGenerate", false);
                generateReport(requestMap);
                byteArray = getByteArray(filePath);
                return new ResponseEntity<>(byteArray, HttpStatus.OK);
            }
        } catch (Exception ex){
            ex.printStackTrace();
        }
        return null;
    }

    private byte[] getByteArray(String filePath) throws Exception {
        File initialFile = new File(filePath);
        InputStream targetStream = new FileInputStream(initialFile);
        byte[] byteArray = IOUtils.toByteArray(targetStream);
        targetStream.close();
        return byteArray;
    }
}
