import { useAuthStore } from "@/stores/useAuthStore";
import { ClientData } from "@/types/clients";
import { pickFromCamera, pickFromGallery } from "@/utils/pickImage";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { createDevolucion, getArts, getBySerial, getClients, getMotives, getOrderByFactNumber } from "../services/ReturnReportService";
import { Articulo } from "../types/Articulo";
import { CreateDevolucion } from "../types/createDevolucion";
import { BarcodeItem } from "../types/Items";
import { Motive } from "../types/motives";
import { deleteImage, pickAndUploadImage } from "../utils/uploadImage";


export function useReturnReport() {


    const { userId, name } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);


    // Product data

    const [factNumber, setFactNumber] = useState("");
    const [barcode, setBarcode] = useState("");
    const [barcodeList, setBarcodeList] = useState<BarcodeItem[]>([]);
    const [serial, setSerial] = useState("");
    const [codeArt, setCodeArt] = useState("");
    const [artDes, setArtDes] = useState("");
    const [artList, setArtList] = useState<Articulo[]>([]);
    const [motives, setMotives] = useState<Motive[]>([]);


    // Customer Data
    const [clients, setClients] = useState<ClientData[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);



    // DSeller data
    const [codeVen, setCodeVen] = useState("");
    const [venDes, setVenDes] = useState("");

    // Form Data
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [image, setImage] = useState<string>("");

    // UI
    const [showScanner, setShowScanner] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showArtModal, setShowArtModal] = useState(false);
    const [showMotiveModal, setShowMotiveModal] = useState(false);
    const [isData, setIsData] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const isFormComplete = () => (
        reason && selectedClient && codeArt && artDes
    );



    const pickImage = async () => {
        const result = await pickFromGallery();
        if (result) setImage(result);
    };

    const handlePickFromCamera = async () => {
        const result = await pickFromCamera();
        if (result) setImage(result);
    };


    const handleSearchFactNum = async () => {
        if (factNumber.length < 1) {
            Alert.alert("Error", "Ingrese un número de factura válido.");
            return;
        }

        try {
            setLoadingData(true);


            const [data, motives] = await Promise.all([getOrderByFactNumber(Number(factNumber)), getMotives()]);
            setMotives(motives)

            if (!data) {
                Alert.alert("Sin resultados", "No se encontró datos  con el número de factura.");
                setIsData(false);

                return;
            }

            setBarcode(data.codbarra || "");

            setCodeVen(data.codven || "");
            setVenDes(data.vendes || "");
            setSerial(data.serial || "");
            setSelectedClient({ co_cli: data.codcli, cli_des: data.clides })

            setBarcodeList(data.art.map((item: Articulo) => ({
                co_art: item.co_art,
                codbarra: item.codbarra
            })));

            const formattedArtList = (data.art as Articulo[]);
            setArtList(formattedArtList);
            setIsData(true)


        } catch (error) {
            Alert.alert("Error", "Ocurrió un error al obtener los datos.");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!codeArt) return;
        if (artList.length < 1) return

        setArtDes(artList.find(c => c.co_art === codeArt)?.art_des ?? '');
        setBarcode(barcodeList.find(b => b.co_art === codeArt)?.codbarra ?? '');
    }, [codeArt]);

    const handleSearchSerial = async () => {
        if (serial.length <= 3) {
            Alert.alert("Error", "Debe ingresar un serial válido.");
            return;
        }

        try {
            setLoadingData(true);

            const [data, motives] = await Promise.all([getBySerial(serial), getMotives()]);
            setMotives(motives)

            if (!data) {
                Alert.alert("Sin resultados", "No se encontró el producto con ese serial.");
                clearForm();


                return;
            }

            setBarcode(data.codbarra || "");
            setCodeArt(data.codart || "");
            setCodeVen(data.codven || "");
            setVenDes(data.vendes || "");
            setArtDes(data.artdes || "");
            setSerial(data.serial || "");
            setSelectedClient({ co_cli: data.codcli, cli_des: data.clides })

            setIsData(true)

        } catch (error) {
            Alert.alert("Error", "Ocurrió un error al obtener los datos.");
        } finally {
            setLoadingData(false);
        }
    };


    const clearForm = () => {
        setBarcode("");
        setSerial("");
        setCodeArt("");
        setArtDes("");
        setReason("");
        setComment("");
        setImage("");
        setArtList([]);
        setBarcodeList([]);
        setSelectedClient(null);
        setFactNumber("");
        setIsData(false)
        setIsManual(false);
    };
    const handleManual = async () => {
        try {
            setLoadingData(true);
            clearForm();

            const [clients, arts, motives] = await Promise.all([getClients(), getArts(), getMotives()]);

            setClients(clients);
            setArtList(arts)
            setMotives(motives)
          

            setBarcodeList(arts.map((item: Articulo) => ({
                co_art: item.co_art,
                codbarra: item.codbarra
            })));

            setIsManual(true);
            setIsData(true);
        } catch (error) {

        } finally {
            setLoadingData(false);
        }
    };
    const registerDefect = async () => {
        if (!isFormComplete()) {
            Alert.alert("Datos sin llenar", "Por favor, verifique los campos.");
            return false;
        }

        let publicUrl: string | undefined;
        let filePath: string | undefined;

        try {
            setLoading(true);

            if (image != null && image !== "") {
                const uploadResult = await pickAndUploadImage(image, userId, serial);

                if (!uploadResult) {
                    Alert.alert("Error", "Ocurrió un error al subir la imagen. Por favor, inténtelo de nuevo.");
                    return false;
                }

                publicUrl = uploadResult.publicUrl;
                filePath = uploadResult.filePath; 
                console.log("Imagen subida en:", filePath);
            }

            const devolucion: CreateDevolucion = {
                fecemis: new Date().toISOString(),
                estatus: "1",
                anulada: "0",
                cerrada: "0",
                codcli: selectedClient?.co_cli.trim() || "",
                clides: selectedClient?.cli_des || "",
                codven: codeVen.trim() || "",
                vendes: venDes,
                codart: codeArt,
                codbarra: barcode,
                artdes: artDes,
                serial1: serial,
                motivo: reason,
                obsvendedor: comment,
                registradopor: name || "Unknown",
                fecharegistro: new Date().toISOString(),
                imgart: publicUrl,
            };

            const success = await createDevolucion(devolucion);

            if (success) {
                Alert.alert("Success", "La devolución fue registrada exitosamente.");
                clearForm();
                return true;
            } else {
                if (filePath && !filePath.startsWith("http")) {
                    const result = await deleteImage(filePath);
                    console.log("Resultado borrado imagen:", result);
                }
                Alert.alert("Error", "No se pudo registrar la devolución, por favor inténtelo de nuevo.");
                return false;
            }
        } catch (err: any) {
            Alert.alert("Error", `No se pudo registrar la devolución: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        // functions
        registerDefect,
        pickImage,
        handlePickFromCamera,
        handleSearchFactNum,
        handleSearchSerial,
        clearForm,
        handleManual,

        // states
        loading,
        barcode, setBarcode,
        serial, setSerial,
        codeArt, setCodeArt,
        artDes, setArtDes,
        reason, setReason,
        comment, setComment,
        image, setImage,
        showScanner, setShowScanner,
        factNumber, setFactNumber,
        loadingData,
        isData,
        artList,
        isManual,
        isFormComplete,
        showArtModal, setShowArtModal,
        motives,

        // customers

        setClients,
        clients,
        selectedClient,
        setSelectedClient,
        showClientModal, setShowClientModal,
        showMotiveModal, setShowMotiveModal,

        // sell
        setCodeVen,
        setVenDes,
        codeVen,
        venDes,
    };
}