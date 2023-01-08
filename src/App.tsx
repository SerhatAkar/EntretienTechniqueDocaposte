import React, { useEffect } from "react";
import "./App.css";
import { Buffer } from "buffer";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

const vc = {
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiableCredential", "EntretienTechnique"],
  credentialSubject: {
    id: "did:example:address",
    informations: {
      type: "Exemple de VC sous standard W3C",
      name: "Serhat Akar",
    },
  },
  issuer: "did:example:address",
  issuanceDate: "2023-01-04",
};

function CircularIndeterminate() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
}

function App() {
  const [keys, setKeys] = React.useState(localStorage.getItem("key"));
  const [openKeysDialog, setOpenKeysDialog] = React.useState(false);
  const [openVCDialog, setOpenVCDialog] = React.useState(false);
  const [VCBeingSigned, setVCBeingSigned] = React.useState(false);
  const [signedVC, setSignedVC] = React.useState<ArrayBuffer>();
  const [cryptoKey, setCryptoKey] = React.useState<CryptoKey>();

  const handleClose = () => {
    setOpenKeysDialog(false);
    setOpenVCDialog(false);
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (cryptoKey) {
      signVC();
    }
  }, [cryptoKey]);

  useEffect(() => {
    if (signedVC) {
      localStorage.setItem(
        "signature",
        JSON.stringify(Buffer.from(signedVC).toString("hex"))
      );
      setVCBeingSigned(false);
    }
  }, [signedVC]);

  const resetAll = () => {
    localStorage.clear();
    setSignedVC(undefined);
    setKeys(null);
    setCryptoKey(undefined);
  };

  const generateKeypairs = async () => {
    setOpenKeysDialog(true);
    if (!keys) {
      const keys = await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-384",
        },
        true,
        ["sign", "verify"]
      );
      await window.crypto.subtle
        .exportKey("jwk", keys.privateKey)
        .then((e) => {
          localStorage.setItem("key", JSON.stringify(e));
        })
        .catch((e) => console.log(e));

      setKeys(localStorage.getItem("key"));
    }
  };

  const startSignature = async () => {
    setVCBeingSigned(true);
    keys &&
      (await window.crypto.subtle
        .importKey(
          "jwk",
          JSON.parse(keys),
          {
            name: "ECDSA",
            namedCurve: "P-384",
          },
          false,
          ["sign"]
        )
        .then((e) => setCryptoKey(e))
        .catch((e) => console.log(e)));
  };

  const signVC = async () => {
    await window.crypto.subtle
      .sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" },
        },
        cryptoKey!,
        Buffer.from(JSON.stringify(vc))
      )
      .then((e) => setSignedVC(e))
      .catch((e) => console.log(e));
  };

  const card = (
    <Card
      style={{
        height: "50vh",
        flexWrap: "wrap",
        overflow: "scroll",
      }}
      variant="outlined"
    >
      <CardContent style={{ height: "90%" }}>
        <Grid
          container
          direction={"column"}
          style={{ height: "100%", justifyContent: "center" }}
        >
          <Grid item>
            <Grid container spacing={5} alignItems="center">
              <Grid item xs={12}>
                <Button
                  style={{ width: "100%" }}
                  color={keys ? "success" : "primary"}
                  variant="contained"
                  onClick={() => generateKeypairs()}
                >
                  Generate your keypair
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{ width: "100%" }}
                  color={signedVC ? "success" : "primary"}
                  variant="contained"
                  onClick={() => setOpenVCDialog(true)}
                >
                  Sign your Verifiable Credential
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{ width: "100%" }}
                  color="primary"
                  variant="contained"
                  onClick={() => resetAll()}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  const explanationsCard = (
    <Card
      style={{
        height: "50vh",

        flexWrap: "wrap",
        overflow: "scroll",
      }}
      variant="outlined"
    >
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" textAlign={"center"}>
              Goal : Sign a verifiable credential using a private key stored in
              the local storage of the web browser.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{ width: "100%" }}
                  color="secondary"
                  variant="contained"
                  href="https://github.com/SerhatAkar/EntretienTechniqueDocaposte"
                  target="_blank"
                >
                  Github
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  This project uses the Web Crypto API in order to generate the
                  keypair and sign the VC. Web Crypto API is a good choice as it
                  is supported by most web browsers. Every calculation is done
                  client side.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  The key is generated with the Crypto Web API generateKey
                  method and exported as a string to the local storage.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  A template of a VC is given (following the W3C standard). A
                  better example would be to build a JWT formatted VC : header +
                  payload + signature in order to follow the EBSI proposal. In
                  this example, the VC is simply a JSON.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  The signature is done with the sign method of the Crypto Web
                  API. The key stored in the local storage is parsed to a JWK
                  formatted key.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  The signature is transformed to a readable hexadecimal format
                  and stored in the local storage.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Grid
      container
      style={{
        background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        minHeight: "100vh",
      }}
      alignItems="center"
    >
      <Grid item xs={12}>
        <Grid container justifyContent={"center"} spacing={5}>
          <Grid item xs={12} sm={12} lg={4} margin="5vh">
            {card}
            <Dialog open={openKeysDialog} onClose={handleClose}>
              <DialogContent>
                {keys ? (
                  <Grid container spacing={2}>
                    <Grid item textAlign={"center"} flexGrow={1}>
                      <Typography style={{ wordWrap: "break-word" }}>
                        Your generated key is
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      textAlign={"center"}
                      maxWidth="100%"
                      flexGrow={1}
                    >
                      <Typography
                        style={{ wordWrap: "break-word" }}
                        fontWeight="bold"
                      >
                        {JSON.parse(keys)["d"]}
                      </Typography>
                    </Grid>
                    <Grid item textAlign={"center"}>
                      <Typography style={{ wordWrap: "break-word" }}>
                        The whole key has been stored under the name "key" in
                        your local storage.
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  CircularIndeterminate()
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} autoFocus>
                  Next
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={openVCDialog} onClose={handleClose}>
              <DialogContent style={{ marginTop: "2vh" }}>
                <Grid
                  container
                  spacing={3}
                  style={{
                    flexDirection: "column",
                  }}
                >
                  {!VCBeingSigned && (
                    <Grid item xs={12}>
                      <Paper elevation={6}>
                        <Grid container spacing={2} padding={1}>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item xs={12}>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Context :
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                >
                                  {vc["@context"]}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item xs={12}>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Type :
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="body1"
                                  style={{ wordWrap: "break-word" }}
                                >
                                  {vc.type[0] + " " + vc.type[1]}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Credential subject id :
                                </Typography>
                              </Grid>
                              <Grid item width={"100%"}>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                >
                                  {vc.credentialSubject.id}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Credential subject type :
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography
                                  variant="body1"
                                  style={{ wordWrap: "break-word" }}
                                >
                                  {vc.credentialSubject.informations.type}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Credential subject author :
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography
                                  variant="body1"
                                  style={{ wordWrap: "break-word" }}
                                >
                                  {vc.credentialSubject.informations.name}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={0}
                            >
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Credential subject issuer :
                                </Typography>
                              </Grid>
                              <Grid item width={"100%"}>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                >
                                  {vc.issuer}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item>
                            <Grid
                              container
                              direction="row"
                              alignItems="flex-start"
                              spacing={3}
                            >
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                  fontWeight={"bold"}
                                >
                                  Credential subject date of delivery :
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography
                                  style={{ wordWrap: "break-word" }}
                                  variant="body1"
                                >
                                  {vc.issuanceDate}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                  {!!VCBeingSigned && (
                    <Grid container justifyContent={"center"}>
                      <Grid item padding={"1vh"}>
                        <CircularIndeterminate />
                      </Grid>
                    </Grid>
                  )}

                  <Grid item style={{ width: "100%" }} textAlign={"center"}>
                    {!VCBeingSigned && !signedVC && keys && (
                      <Typography
                        fontWeight="bold"
                        style={{ wordWrap: "break-word" }}
                      >
                        This VC will be signed with the previously generated
                        privateKey {JSON.parse(keys)["d"]}
                      </Typography>
                    )}
                    {!!VCBeingSigned && !signedVC && (
                      <Typography fontWeight="bold">
                        The VC is being signed.
                      </Typography>
                    )}
                    {signedVC && (
                      <React.Fragment>
                        <Grid container spacing={3}>
                          <Grid item flexGrow={1} textAlign="center">
                            <Typography
                              fontWeight="bold"
                              style={{ wordWrap: "break-word" }}
                            >
                              Your VC has been signed with the signature :
                            </Typography>
                          </Grid>
                          <Grid item maxWidth={"100%"}>
                            <Typography
                              fontWeight="bold"
                              color={"green"}
                              style={{ wordWrap: "break-word" }}
                            >
                              {Buffer.from(signedVC!).toString("hex")}
                            </Typography>
                          </Grid>
                          <Grid item flexGrow={1} textAlign="center">
                            <Typography
                              fontWeight="bold"
                              style={{ wordWrap: "break-word" }}
                            >
                              It has been stored in your local storage.
                            </Typography>
                          </Grid>
                        </Grid>
                      </React.Fragment>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Grid item xs={12}>
                  <Box textAlign={"center"}>
                    <Button
                      onClick={() =>
                        signedVC ? setOpenVCDialog(false) : startSignature()
                      }
                      variant="contained"
                      color="success"
                      style={{ width: "100%", padding: "1vh" }}
                      autoFocus
                      disabled={VCBeingSigned || !keys ? true : false}
                    >
                      {VCBeingSigned && <Typography>Loading</Typography>}
                      {!keys && (
                        <Typography>Please generate your keys first</Typography>
                      )}
                      {keys && !VCBeingSigned && <Typography>Next</Typography>}
                    </Button>
                  </Box>
                </Grid>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item xs={12} sm={12}  lg={4} margin="5vh">
            {explanationsCard}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
