import { useState, useMemo, useEffect } from "react";
import { TextField, Button, Typography, Box, IconButton, Radio, RadioGroup, FormControlLabel, Grid, ToggleButton, ToggleButtonGroup, Link, useMediaQuery, useTheme, Snackbar, Alert, CircularProgress  } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import "@fontsource/titillium-web/900.css";
import { SketchPicker } from "react-color";
import "@fontsource/kanit"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import InfoDialog from "./InfoDialog";


const Shortened = () => {
    const [longUrl, setLongUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [expiration, setExpiration] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [ShowExpiration, setShowExpiration] = useState(false);
    const [error, setError] = useState(false);
    const [editLink, setEditLink] = useState("");
    const [qrCode, setQrCode] = useState(null); 

    const [viewMode, setViewMode] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [qrForeground, setQrForeground] = useState("#000000"); // Default black
    const [qrBackground, setQrBackground] = useState("#ffffff"); // Default white

    const [openInfoDialog, setOpenInfoDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");



    const apiUrl = import.meta.env.VITE_API_URL;
    // console.log("API URL:", apiUrl);

    // const frontendurl = import.meta.env.VITE_FRONTEND_URL;
    // console.log("FRONTEND URL:", frontendurl);


    const blockPositions = useMemo(() => {
        return Array.from({ length: 3000 }, () => ({}));
      }, []);


      const isValidUrl = (url) => {
        try {
            const regex = /^(https?:\/\/)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)$/;
            return regex.test(url);
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        if (openSnackbar) {
            setTimeout(() => setOpenSnackbar(false), 3000);  // Close Snackbar after 3 seconds
        }
    }, [openSnackbar]);
    

    const handleShorten = async () => {

        // setLoading(true);

        if (!longUrl.trim() || !isValidUrl(longUrl)) {
            setError(true);
            return;
        }
        setError(false);
    
        // Validate URL format before sending
        if (!/^https?:\/\//.test(longUrl)) {
            alert("Invalid URL format. Please make sure it starts with http:// or https://");
            return;
        }
    
        try {
            // Ensure expiration date is in the future if provided
            const expirationDate = expiration ? new Date(expiration) : null;
            if (expirationDate && expirationDate <= new Date()) {
                alert("Expiration date must be in the future.");
                return;
            }
    
            const response = await axios.post(`${apiUrl}/shorten`, {
                long_url: longUrl,
                custom_alias: customAlias || null,
                expiration_date: expirationDate ? expirationDate.toISOString() : null
            });
    
            if (response.data.already_shortened) {
                setSnackbarMessage("This URL has already been shortened.");
                setSnackbarSeverity("warning");
                setOpenSnackbar(true);
                return;
            }

            setLoading(true);

    
            setShortUrl(response.data.shortened_url);
            setEditLink(response.data.edit_link);
            setQrCode(response.data.qr_code);
            setViewMode("shortened");
            
            setSnackbarMessage("URL shortened successfully!");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
    
        } catch (error) {
            console.error("Error shortening URL", error);
    
            // Log the full error object to inspect its structure
            console.error("Error details:", error.response || error);
    
            if (error.response) {
                if (error.response.status === 400) {
                    alert(error.response.data.detail || "Custom alias already in use. Please try a different one.");
                } else if (error.response.status === 500) {
                    alert("Server error occurred. Please try again later.");
                } else if (error.response.status === 422) {
                    alert(`Backend Validation Error: ${error.response.data.detail || 'Unknown error'}`);
                } else {
                    alert("An unknown error occurred. Please try again.");
                }
            } else {
                alert("Network error. Please check your connection.");
            }
        }
        setLoading(false);
    };

    const handleCopy = async (value) => {
        try {
            await navigator.clipboard.writeText(value);
            setSnackbarMessage(`copied to clipboard!`);
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
        } catch (err) {
            console.error("Failed to copy: ", err);
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

    useEffect(() => {
        if (!viewMode) {
            setLongUrl('');
            setCustomAlias('');
            setExpiration('');
        }
    }, [viewMode]);
    

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
                
             

            {/* Main Shortener Box */}
            <Box sx={{ zIndex: 10, textAlign: "center", width: { xs: "90%", sm: "70%", md: "50%", lg: "40%" }, maxWidth: 600, p: 4, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(10px)", boxShadow: 3,}}>
            <Typography 
                    variant="h2" 
                    sx={{ 
                    fontFamily: "'kanit', sans-serif",
                    fontWeight: 700, 
                    color: "white", 
                    mb: 3, 
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    }}
                >
                    Shorten your URL 
                </Typography>
            
            {!viewMode && (
              <>

                <TextField 
                    label="Enter URL" 
                    fullWidth 
                    value={longUrl} 
                    onChange={(e) => setLongUrl(e.target.value)} 
                    InputLabelProps={{
                        style: { color: "white" }, 
                      }} 
                    sx={{ 
                        mb: 2,
                        input: { color: "white" },
                        label: { color: "white" },
                        "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "white" },
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                     }} 
                    error={error} 
                    helperText={error ? "Please enter a valid URL" : ""}
                    InputProps={{
                        style: { color: "white" },
                      }} 
                />

                <TextField 
                    label="Custom Alias (optional)" 
                    fullWidth 
                    value={customAlias} 
                    onChange={(e) => setCustomAlias(e.target.value)}
                    InputLabelProps={{
                        style: { color: "white" }, 
                      }} 
                    sx={{ 
                        mb: 2, 
                        input: { color: "white" }, 
                        label: { color: "white" },
                        "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "white" },
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                }}
                InputProps={{
                    style: { color: "white" },
                  }} 
                />

                <RadioGroup row>
                    <FormControlLabel control={
                        <Radio
                        sx={{ color: "white", "&.Mui-checked": { color: "white" },}}
                        disableRipple // Removes the default blue effect 
                        checked={!ShowExpiration} 
                        onChange={() => setShowExpiration(false)} />
                        
                        } 
                        label={<span style={{ color: "white" }}>Permanent</span>}
                          />
                    <FormControlLabel control={
                        <Radio
                        sx={{ color: "white", "&.Mui-checked": { color: "white" }}}
                        disableRipple // Removes the default blue effect  
                        checked={ShowExpiration} 
                        onChange={() => setShowExpiration(true)} />
                    } 
                        label={<span style={{ color: "white" }}>Set Expiration</span>} />
                </RadioGroup>

                { ShowExpiration && <TextField
                    label="Expiration Date"
                    type="datetime-local" 
                    fullWidth 
                    value={expiration} 
                    onChange={(e) => setExpiration(e.target.value)}
                    InputLabelProps={{
                        shrink: true,  // Prevents label from overlapping
                        style: { color: "white" }, 
                      }}
                    InputProps={{
                        style: { color: "white" },
                      }}  
                    sx={{ 
                        mt: 2,
                        mb: 3, input: { color: "white" }, label: { color: "white" },
                        "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "white" },
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                     
                    }}
                    
                      />}

                <Button onClick={handleShorten} variant="contained" sx={{ bgcolor: "#03A9F4", color: "#FFF", borderRadius: "30px", px: 4, py: 1.5, "&:hover": { bgcolor: "#0288D1" } }} disabled={loading}>{loading ? <CircularProgress size={24} /> : "Shorten"}</Button>
                </>
            )}
                {viewMode && (
                    
                    <ToggleButtonGroup 
                        value={viewMode} 
                        exclusive 
                        onChange={(event, newView) => newView && setViewMode(newView)}
                        orientation={isSmallScreen ? "vertical" : "horizontal"} // Responsive layout
                        sx={{
                             mb: 2,
                             display: "flex", 
                             flexDirection: isSmallScreen ? "column" : "row",
                             alignItems: "center",
                             justifyContent: "center"
                            }}
                    >
                        <ToggleButton value="shortened" fullWidth  sx={{ color: "white", borderColor: "white", "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)", color: "white" } }}>Short URL</ToggleButton>
                        <ToggleButton value="qrcode" fullWidth  sx={{ color: "white", borderColor: "white", "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)", color: "white" } }}>QR Code</ToggleButton>
                        <ToggleButton value="editlink" fullWidth  sx={{ color: "white", borderColor: "white", "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)", color: "white" } }}>Edit URL</ToggleButton>

                    </ToggleButtonGroup>
                )}

                 {/* Shortened Link View */}
                 {viewMode === "shortened" && (
                    <Box>
                        <Typography 
                            variant="h1" 
                            sx={{ 
                            fontFamily: "'kanit', sans-serif",
                            fontWeight: 500, 
                            color: "white",
                            mt:3, 
                            mb: 3, 
                            fontSize: { xs: "1.5rem", sm: "1.5rem", md: "1.5rem" },
                            }}
                            >
                            Your Short URL ready
                        </Typography>
                    

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                            <Typography variant="body1" >
                                <Link href={shortUrl} target="_blank"  rel="noopener noreferrer" sx={{ color: "#FFF", wordBreak: "break-word", textDecoration: "none", "&:hover": { textDecoration: "underline" }, ml:2.5 }}>
                                    {shortUrl}
                                </Link>
                            </Typography>
                            <IconButton onClick={() => handleCopy(shortUrl)}><ContentCopyIcon sx={{ color: "white", mr:1 }} /></IconButton>
                          
                        </Box>
                    </Box>
                 )}

                {/* QR Code View */}
                {viewMode === "qrcode" && (

                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3 }}>
                            <QRCodeCanvas value={shortUrl}  size={isSmallScreen ? 150 : 200}  fgColor={qrForeground} bgColor={qrBackground}  style={{ border: "4px solid white", borderRadius: "10px"  }} />
                            <Button fullWidth onClick={() => setShowColorPicker(!showColorPicker)} sx={{ mt: 2, color: "#FFF", border: "1px solid white", borderRadius: "20px", px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }  }}>
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
                            <Button fullWidth onClick={downloadQR} variant="outlined" sx={{ mt: 2, color: "#FFF", border: "1px solid white", borderRadius: "20px", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 } }}>Download QR Code</Button>
                        </Box>
                )}
                {/* Edit Link  View */}
                {viewMode === "editlink" && (
                    <Box>
                    <Typography 
                        variant="h1" 
                        sx={{ 
                        fontFamily: "'kanit', sans-serif",
                        fontWeight: 500, 
                        color: "white",
                        mt:3, 
                        mb: 3, 
                        fontSize: { xs: "1.5rem", sm: "1.5rem", md: "1.5rem" },
                        }}
                        >
                        Here is the Edit link to modify !
                    </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                        <Typography variant="body1" >
                            <Link href={editLink} target="_blank"  rel="noopener noreferrer" sx={{ color: "#FFF", wordBreak: "break-word", textDecoration: "none", "&:hover": { textDecoration: "underline" }, ml:2.5 }}>
                                {editLink}
                            </Link>
                        </Typography>
                        <IconButton onClick={() => handleCopy(editLink)}><ContentCopyIcon sx={{ color: "white", mr:1 }} /></IconButton>
                      
                        </Box>
                    </Box>
                )}

                {/* Reset Button */}
                {viewMode && (
                    <Button 
                        onClick={() => {
                            setViewMode(null);
                            setShortUrl("");
                        }} 
                        variant="text" 
                        sx={{ mt: 2, color: "#FFF", textDecoration: "underline" }}>
                        Shorten Another URL
                    </Button>
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

export default Shortened;
