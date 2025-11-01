import { Button, Typography, Box, Dialog, DialogActions, DialogContent, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme  } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import BoltIcon from "@mui/icons-material/Bolt";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublicIcon from "@mui/icons-material/Public";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PaletteIcon from "@mui/icons-material/Palette";
import TimerIcon from "@mui/icons-material/Timer"; // Expiration date & time icon
import EditIcon from "@mui/icons-material/Edit"; // Edit link icon
import ContentCopyIcon from "@mui/icons-material/ContentCopy";



const InfoDialog = ({ open, onClose }) => {

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
    


  return (
    <Box>
       {/* Information Dialog */}
       <Dialog open={open} onClose={onClose}  maxWidth={isSmallScreen ? "xs" : isMediumScreen ? "sm" : "md"} fullWidth>
                <DialogContent sx={{ fontFamily: "'kanit', sans-serif" }}>
                    {/* Welcome Header */}
                    <Typography variant={isSmallScreen ? "h6" : isMediumScreen ? "h5" : "h4"} fontWeight="bold" mb={2} sx={{ fontFamily: "'kanit', sans-serif" }} >
                        Welcome to SiNK
                    </Typography>

                    {/* Subtext */}
                    <Typography variant="body1" fontSize={isSmallScreen ? 13 : isMediumScreen ? 14 : 16} mb={2} sx={{ fontFamily: "'kanit', sans-serif" }}>
                        SiNK is a fast, reliable, and professional URL shortener that simplifies long web links into concise, shareable URLs.
                    </Typography>

                    {/* How It Works */}
                    <Typography variant={isSmallScreen ? "h6" : isMediumScreen ? "h5" : "h4"} fontWeight="bold" mt={2} mb={1} sx={{ fontFamily: "'kanit', sans-serif" }}>
                        How It Works
                    </Typography>
                    <List fontSize={isSmallScreen ? 12 : isMediumScreen ? 14 : 16}>
                        <ListItem>
                            <ListItemIcon>
                                <LinkIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Paste your long URL into the input box" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <BoltIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary='Click "Shorten" to generate a unique link' sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                        <ListItemIcon>
                        <TimerIcon sx={{ color: "inherit" }} />
                        </ListItemIcon>
                        <ListItemText primary="Optionally set an expiration date and time for the link" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                            <EditIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="After shortening, get an edit link to modify the alias or expiration" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <ContentCopyIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Copy and share your new short link anywhere" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <BarChartIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Track link clicks and analytics (coming soon)" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                    </List>

                    {/* Why Use ShortInk? */}
                    <Typography variant={isSmallScreen ? "h6" : isMediumScreen ? "h5" : "h4"} fontWeight="bold" mt={3} mb={1} sx={{ fontFamily: "'kanit', sans-serif" }}>
                        Why Use SiNK?
                    </Typography>
                    <List>
                        <ListItem >
                            <ListItemIcon>
                                <BoltIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText  primary="Instant link shortening for quick sharing" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Custom aliases for personalized URLs" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <PublicIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Works across all social media platforms" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Free to use with no hidden charges" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <QrCodeIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                            <ListItemText primary="Free QR Code Available for every short link" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <PaletteIcon sx={{ color: "inherit" }} />
                            </ListItemIcon>
                        <ListItemText primary="Customize QR code color to match your style" sx={{ fontFamily: "'kanit', sans-serif", fontSize: isSmallScreen ? 12 : isMediumScreen ? 14 : 16 }}/>
                    </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary" sx={{ fontFamily: "'kanit', sans-serif" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


    </Box>
  )
}

export default InfoDialog
