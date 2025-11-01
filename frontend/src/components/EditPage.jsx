import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, IconButton, Link , useMediaQuery, useTheme, Snackbar , Alert, CircularProgress  } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";
import { SketchPicker } from "react-color";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import InfoDialog from "./InfoDialog";
import "@fontsource/kanit"
import "@fontsource/titillium-web/900.css";




const EditPage = () => {

     const {editId} = useParams();

    const [longUrl, setLongUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [expiration, setExpiration] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [qrForeground, setQrForeground] = useState("#000000");
    const [qrBackground, setQrBackground] = useState("#ffffff");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [previousShortenedUrl, setPreviousShortenedUrl] = useState('');
    const [updated, setUpdated] = useState(false);
    const [ShowExpiration, setShowExpiration] = useState(false);
    
    const [loading, setLoading] = useState(false);
 

    const [qrCode, setQrCode] = useState("");

    const [openInfoDialog, setOpenInfoDialog] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
   
      
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");


    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("API URL:", apiUrl);

    const frontendURL = import.meta.env.VITE_FRONTEND_URL;
    console.log("Frontend URL:", frontendURL);

    // const frontendurl = import.meta.env.VITE_FRONTEND_URL;
   



     const blockPositions = useMemo(() => {
            return Array.from({ length: 3000 }, () => ({}));
          }, []);


          useEffect(() => {
            // Fetch existing shortened URL details
            const fetchUrlDetails = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/edit/${editId}`);
                    setLongUrl(response.data.long_url);
                    setCustomAlias(response.data.short_code); // Pre-fill the alias field
        
                    // Safely handle the expiration date
                    const expirationDate = response.data.expiration_date;
                    let formattedExpiration = '';

                    if (expirationDate) {
                        const dateObj = new Date(expirationDate);
                        if (!isNaN(dateObj.getTime())) {
                            formattedExpiration = dateObj.toISOString().slice(0, 16); // 'yyyy-MM-ddTHH:mm'
                        } else {
                            console.error("Invalid expiration date format:", expirationDate);
                        }
                    }

                    setExpiration(formattedExpiration);

                    setShortUrl(response.data.shortened_url);
                    setPreviousShortenedUrl(`${apiUrl}/${response.data.short_code}`);
                } catch (error) {
                    console.error("Error fetching URL details:", error);
                    setSnackbarMessage("Failed to fetch URL details.");
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);
                }
            };
            fetchUrlDetails();
        }, [editId]);
        
        const handleUpdateEdit = async () => {
            // Show feedback and prevent multiple clicks
            setLoading(true);  // Start loading state
            setSnackbarMessage("");  // Clear any previous snackbar messages
        
            // Validate optional custom alias and expiration date
            if (customAlias && !/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
                setSnackbarMessage("Alias can only contain letters, numbers, underscores, and hyphens.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                setLoading(false);
                return;
            }
        
            if (expiration && new Date(expiration).getTime() <= new Date().getTime()) {
                setSnackbarMessage("Expiration date must be in the future.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                setLoading(false);
                return;
            }
        
            // Format expiration date correctly (yyyy-MM-ddTHH:mm)
            let expirationDate = null;
            if (expiration  && expiration !== "permanent") {
                const dateObj = new Date(expiration);
                if (!isNaN(dateObj.getTime())) {
                    expirationDate = dateObj.toISOString().slice(0, 16); // Ensure format is 'yyyy-MM-ddTHH:mm'
                } else {
                    console.error("Invalid expiration date format:", expiration);
                }
            }

            // Log expiration date being sent to the backend
            console.log("Expiration Date Sent: ", expirationDate);  // This will log the date

            
            const aliasToSend = customAlias || previousShortenedUrl.split("/").pop(); // Extract the alias from the previous shortened URL
        
            // Making an API call to check if custom alias already exists
            try {
                const response = await axios.put(`${apiUrl}/edit/${editId}`, {
                    custom_alias: aliasToSend,
                    expiration_date: expirationDate 
                });
        
                // Update the new short URL & QR code
                setShortUrl(response.data.shortened_url);
                setQrCode(response.data.qr_code);
        
                setUpdated(true);
                setSnackbarMessage("URL shortened successfully!");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
        
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 400 && error.response.data.detail === 'Server error: 400: Cannot edit an expired URL.') {
                        setSnackbarMessage("This URL has expired and cannot be edited.");
                    } else {
                        setSnackbarMessage(error.response.data.detail); // Display any other custom alias error or backend error message
                    }
                } else {
                    console.error("Error updating URL:", error);
                    setSnackbarMessage("Failed to update URL!");
                }
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
            }
        
            setLoading(false);
            setUpdated(true); // Set the update flag to true to reflect the changes
        };
        
    
         
    const handleCopyUpdate = async () => {
     
        try {
            await navigator.clipboard.writeText(shortUrl || previousShortenedUrl);
            setSnackbarMessage(`copied to clipboard!`);
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
        } catch (err) {
            console.error("Failed to copy: ", err);
            // setSnackbar({ open: true, message: "Failed to copy URL!", severity: "error" });
        }
    };

    const downloadQR = () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = "qrcode.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#0050EF", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>


                        {/* Info Icon */}
            <IconButton 
                sx={{ position: "absolute", top: { xs: 15, sm: 25, md: 25 }, right: { xs: 10, sm: 20, md: 20 }, color: "white", fontSize: { xs: 24, sm: 30, md: 30 }, zIndex: 1400 }} 
                onClick={() => { 
                    setOpenInfoDialog(true)}} // Open info dialog when clicked
            >
            <InfoOutlinedIcon />
            </IconButton>
            <InfoDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} />

           
            {/* The rest of your existing JSX code here... */}


            {/* Background Blocks */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gridTemplateRows: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "20px",
                    position: "absolute",
                    top: 10,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
                >
                {blockPositions.map((_, index) => {
                    const shapeType = ["circle", "triangle", "square"];
                    const randomShape = shapeType[Math.floor(Math.random() * shapeType.length)];

                    return (
                    <Box
                        key={index}
                        sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: randomShape === "circle" ? "50%" : randomShape === "square" ? "12px" : "0",
                        clipPath: randomShape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "none",
                        boxShadow: "0px 10px 30px rgba(77, 77, 77, 0.3)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                        "&:hover": {
                            transform: "rotate(90deg)",
                            boxShadow: "0px 15px 35px rgba(255, 255, 255, 0.64)",
                        }
                        }}
                    />
                    );
                })}
            </Box>


            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                textAlign: 'center',
                position: 'absolute',
                top: 5,
                paddingTop: '20px',
                }}>
                <Typography 
                    variant="h3" 
                    sx={{ 
                    fontFamily: "'Titillium Web', sans-serif", 
                    fontWeight: 700, 
                    color: "white", 
                    mb: 3, 
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                    textShadow: '2px 2px 10px rgba(140, 138, 138, 0.8)', // Adds glow effect to text
                    }}
                >
                    SiNK
                </Typography>
            </Box>
                

     
            <Box sx={{ zIndex: 10, textAlign: "center", width: { xs: "90%", sm: "70%", md: "50%", lg: "40%" }, maxWidth: 600, p: 4, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: 3 }}>
                <Typography variant="h2" sx={{ fontFamily: "'kanit', sans-serif", fontWeight: 700, color: "white", mb: 3, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" }}}>
                    Edit Your URL
                </Typography>

                <Typography variant="body1" sx={{ color: "white", mb: 1 }}>Original URL:</Typography>
                <Typography variant="body2" sx={{ color: "white", fontWeight: "bold", wordWrap: "break-word", mb: 2 }}>{longUrl}</Typography>
                
                <Typography variant="body1" sx={{ color: "white", mb: 1 }}>Shortened URL:</Typography>
                <Typography variant="body2" sx={{ color: "white", fontWeight: "bold", wordWrap: "break-word", mb: 2 }}>{previousShortenedUrl}</Typography>
                

                {!updated ? (
                    <>
                       
                        <TextField 
                            label="Custom Alias (optional)" 
                            fullWidth 
                            value={customAlias} 
                            onChange={(e) => setCustomAlias(e.target.value)} 
                            InputLabelProps={{ style: { color: "white" } }} 
                            sx={{ mb: 2, input: { color: "white" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" }, "&:hover fieldset": { borderColor: "white" }, "&.Mui-focused fieldset": { borderColor: "white" }, backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                        />

                        <RadioGroup row>
                            <FormControlLabel control={<Radio sx={{ color: "white", "&.Mui-checked": { color: "white" } }} checked={!ShowExpiration} onChange={() => setShowExpiration(false)} />} label={<span style={{ color: "white" }}>Permanent</span>} />
                            <FormControlLabel control={<Radio sx={{ color: "white", "&.Mui-checked": { color: "white" } }} checked={ShowExpiration} onChange={() => setShowExpiration(true)} />} label={<span style={{ color: "white" }}>Set Expiration</span>} />
                        </RadioGroup>

                        {ShowExpiration && (
                            <TextField
                                label="Expiration Date"
                                type="datetime-local" 
                                fullWidth 
                                value={expiration} 
                                onChange={(e) => setExpiration(e.target.value)}
                                InputLabelProps={{ shrink: true, style: { color: "white" } }}
                                sx={{ mt: 2, mb: 3, input: { color: "white" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" }, "&:hover fieldset": { borderColor: "white" }, "&.Mui-focused fieldset": { borderColor: "white" }, backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
                            />
                        )}

                        <Button onClick={handleUpdateEdit} variant="contained" sx={{ bgcolor: "#03A9F4", color: "#FFF", borderRadius: "30px", px: 4, py: 1.5, "&:hover": { bgcolor: "#0288D1" } }} disabled={loading}>{loading ? <CircularProgress size={24} /> : "Update URL"}</Button>

                        
                    </>
                ) : (
                    <>

                        <Typography variant="h6" sx={{ color: "white", mt: 3 }}>Updated URL:</Typography>
                        
                        
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
                            <Typography variant="body1" >
                                <Link href={shortUrl || previousShortenedUrl} target="_blank"  rel="noopener noreferrer" sx={{ color: "#FFF", wordBreak: "break-word", textDecoration: "none", "&:hover": { textDecoration: "underline" }, ml:2.5 }}>
                                 { shortUrl || previousShortenedUrl}
                                </Link>
                            </Typography>
                            <IconButton onClick={handleCopyUpdate}><ContentCopyIcon sx={{ color: "white", mr:1 }} /></IconButton>
                        </Box>
                        
                        <Typography variant="h6" sx={{ color: "white", mt: 2 }}>QR Code:</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
                        <QRCodeCanvas
                            value={shortUrl || previousShortenedUrl}
                            size={isSmallScreen ? 150 : 200}
                            fgColor={qrForeground}
                            bgColor={qrBackground}
                            style={{ border: "4px solid white", borderRadius: "10px" }}
                        />
                        <Button fullWidth onClick={() => setShowColorPicker(!showColorPicker)} sx={{ mt: 2, color: "#FFF", border: "1px solid white", borderRadius: "20px", px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 } }}>
                            {showColorPicker ? "Hide" : "Customize QR Colors"}
                        </Button>

                        {/* Color Pickers */}
                        {showColorPicker && (
                        <Grid container spacing={3} sx={{ mt: 2, justifyContent: "center" }}>
                            <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography sx={{ color: "white", mb: 1 }}>Foreground</Typography>
                                <SketchPicker
                                color={qrForeground}
                                onChange={(color) => setQrForeground(color.hex)}
                                width="100%"
                                style={{ maxWidth: 250 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography sx={{ color: "white", mb: 1 }}>Background</Typography>
                                <SketchPicker
                                color={qrBackground}
                                onChange={(color) => setQrBackground(color.hex)}
                                width="100%"
                                style={{ maxWidth: 250 }}
                                />
                            </Grid>
                            </Grid>
                        )}
                        <Button fullWidth onClick={downloadQR} variant="outlined" sx={{ mt: 2, color: "#FFF", border: "1px solid white", borderRadius: "20px", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 } }}>
                            Download QR Code
                        </Button>
                        </Box>
                    
                    <Button onClick={() => setUpdated(false)} variant="text" sx={{ mt: 2, color: "#FFF", textDecoration: "underline" }}>Edit Again</Button>
                </>
                )}
            </Box>
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
            <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
            {snackbarMessage}
            </Alert>
        </Snackbar>
        </Box>
    );
};

export default EditPage;
