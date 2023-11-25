import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { isValidNumber, isValidPhoneNumber } from "libphonenumber-js";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import SelectDropdown from "react-native-select-dropdown";

import { useAddPersonMutation } from "../../app/services/people";

function TCNOKontrol(TCNO) {
  var tek = 0,
    cift = 0,
    sonuc = 0,
    TCToplam = 0,
    i = 0,
    hatali = [
      11111111110, 22222222220, 33333333330, 44444444440, 55555555550,
      66666666660, 7777777770, 88888888880, 99999999990,
    ];

  if (TCNO.length != 11) return false;
  if (isNaN(TCNO)) return false;
  if (TCNO[0] == 0) return false;

  tek =
    parseInt(TCNO[0]) +
    parseInt(TCNO[2]) +
    parseInt(TCNO[4]) +
    parseInt(TCNO[6]) +
    parseInt(TCNO[8]);
  cift =
    parseInt(TCNO[1]) +
    parseInt(TCNO[3]) +
    parseInt(TCNO[5]) +
    parseInt(TCNO[7]);

  tek = tek * 7;
  sonuc = tek - cift;
  if (sonuc % 10 != TCNO[9]) return false;

  for (var i = 0; i < 10; i++) {
    TCToplam += parseInt(TCNO[i]);
  }

  if (TCToplam % 10 != TCNO[10]) return false;

  if (hatali.toString().indexOf(TCNO) != -1) return false;

  return true;
}

const isThatValidPhoneNumber = (phoneNumber) => {
  try {
    const phoneInfo = parsePhoneNumberFromString(phoneNumber, "TR");

    return isValidPhoneNumber(phoneNumber, "TR");
  } catch (error) {
    return false;
  }
};

const formatPhoneNumber = (phoneNumber) => {
  try {
    const phoneInfo = parsePhoneNumberFromString(phoneNumber, "TR");
    const formattedNumber = new AsYouType("TR").input(phoneNumber);

    // formattedNumber içinde telefon numarası istediğiniz formatta bulunacaktır
    // Örneğin: +90 5xx xxx xx xx
    return formattedNumber;
  } catch (error) {
    console.error("Telefon numarası formatlama hatası:", error);
    return phoneNumber; // Hata durumunda orijinal numarayı döndürür
  }
};

const initialValues = {
  tcno: "",
  serino: "",
  dogumtarihi: "",
  telno: "",
  il: "",
  ilce: "",
  mahalle: "",
  kvkkonay: false,
  sozlesmeonay: false,
};

const countries = ["asfjklsfjka", "asdffasd"];

const BecomeCustomerScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(0);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setselectedDistrict] = useState("");
  const [towns, setTowns] = useState([]);

  const [addPerson, status] = useAddPersonMutation();

  useEffect(() => {
    fetch("https://api.kadircolak.com/Konum/JSON/API/ShowAllCity")
      .then((response) => response.json())
      .then((data) => {
        const cityTexts = data.map((city) => city.TEXT);
        setCities(cityTexts);
      });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetch(
        `https://api.kadircolak.com/Konum/JSON/API/ShowDistrict?plate=${selectedCity}`
      )
        .then((response) => response.json())
        .then((data) => {
          const districtTexts = data.map((district) => district.DISTRICT);
          setDistricts(districtTexts);
        });
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(
        `https://api.kadircolak.com/Konum/JSON/API/ShowTown?plate=${selectedCity}&district=${selectedDistrict}`
      )
        .then((response) => response.json())
        .then((data) => {
          const townTexts = data.map((town) => town.TOWN);
          setTowns(townTexts);
        });
    }
  }, [selectedDistrict]);

  return (
    <Formik
      initialValues={initialValues}
      validate={(values) => {
        const errors = {};
        if (!TCNOKontrol(values.tcno)) {
          errors.tcno = "Girmiş olduğunuz T.C. Kimlik no hatalıdır.";
        }
        if (values.serino.length != 9) {
          errors.serino =
            "Lütfen Kimlik Seri No alanını 9 hane olacak şekilde giriniz.";
        }
        if (!values.dogumtarihi) {
          errors.dogumtarihi = "Doğum tarihi boş bırakılamaz.";
        }
        if (!isThatValidPhoneNumber(values.telno)) {
          errors.telno = "Geçerli bir telefon numarası giriniz.";
        }
        if (values.il == "") {
          errors.il = "Lütfen il seçiniz.";
        }
        if (values.ilce == "") {
          errors.ilce = "Lütfen ilçe seçiniz.";
        }
        if (values.mahalle == "") {
          errors.mahalle = "Lütfen mahalle seçiniz.";
        }

        return errors;
      }}
      onSubmit={(values, { resetForm }) => {
        console.log(values);
        addPerson({
          tcno: values.tcno,
          serino: values.serino,
          dogumtarihi: values.dogumtarihi,
          telno: values.telno,
          il: values.il,
          ilce: values.ilce,
          mahalle: values.mahalle,
        })
          .unwrap()
          .then((response) => {
            console.log("Person added successfully:", response);
            resetForm();
          })
          .catch((error) => {
            console.error("Error adding person:", error);
          });
      }}
    >
      {({ values, errors, handleChange, setFieldValue, handleSubmit }) => (
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor="#902048" />
          <View style={styles.header}>
            <Entypo name="chevron-left" size={24} color="white" />
            <Text style={styles.headerText}>Müşteri Ol</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progress}></View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Sizi tanıyabilmemiz için lütfen{" "}
              <Text style={styles.boldText}>kimlik</Text> ve{" "}
              <Text style={styles.boldText}>telefon </Text>
              bilgilerinizi girin
            </Text>
          </View>
          <View style={styles.body}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>T.C. Kimlik No</Text>
                <View style={styles.inputField}>
                  <FontAwesome5 name="user" size={24} color="black" />
                  <TextInput
                    style={styles.inputStyle}
                    value={values.tcno}
                    onChangeText={handleChange("tcno")}
                    keyboardType="numeric"
                  />
                  {errors.tcno && (
                    <Text style={styles.error}>{errors.tcno}</Text>
                  )}
                </View>
              </View>
              <View style={styles.inputFields}>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                  }}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <Text style={styles.modalText}>
                        Yeni kimlik kartınızın ön yüzünde bulunan seri
                        numarasıdır
                      </Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>
                          Bilgilendiriciyi Kapat
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
                <View style={styles.seriNoHead}>
                  <Text style={styles.inputHeadText}>Kimlik Seri No</Text>
                  <TouchableOpacity
                    style={styles.seriNoPopup}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.seriNoPopupText}>?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputField}>
                  <FontAwesome name="id-card-o" size={24} color="black" />
                  <TextInput
                    style={styles.inputStyle}
                    value={values.serino}
                    onChangeText={handleChange("serino")}
                  />
                  {errors.serino && (
                    <Text style={styles.error}>{errors.serino}</Text>
                  )}
                </View>
              </View>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>Doğum Tarihi</Text>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Feather name="calendar" size={24} color="black" />
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Doğum Tarihi"
                    value={
                      values.dogumtarihi
                        ? format(new Date(values.dogumtarihi), "dd MMM yyyy")
                        : ""
                    }
                    editable={false}
                  />
                  {errors.dogumtarihi && (
                    <Text style={styles.error}>{errors.dogumtarihi}</Text>
                  )}
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={selectedDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setSelectedDate(date);
                        setFieldValue(
                          "dogumtarihi",
                          date.toISOString().split("T")[0]
                        );
                      }
                    }}
                  />
                )}
              </View>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>Cep Telefonu No</Text>
                <View style={styles.inputField}>
                  <MaterialCommunityIcons
                    name="cellphone"
                    size={24}
                    color="black"
                  />
                  <TextInput
                    style={styles.inputStyle}
                    value={values.telno}
                    onChangeText={handleChange("telno")}
                    onBlur={() =>
                      setFieldValue("telno", formatPhoneNumber(values.telno))
                    }
                    keyboardType="phone-pad"
                  />
                  {errors.telno && (
                    <Text style={styles.error}>{errors.telno}</Text>
                  )}
                </View>
              </View>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>İl</Text>
                <View style={styles.inputField}>
                  <MaterialCommunityIcons name="map" size={24} color="black" />
                  <SelectDropdown
                    data={cities}
                    defaultButtonText="Seçiniz"
                    onSelect={(selectedItem, index) => {
                      setFieldValue("il", selectedItem);
                      setSelectedCity(index + 1);
                    }}
                    buttonStyle={styles.dropdown}
                  />
                  {errors.il && <Text style={styles.error}>{errors.il}</Text>}
                </View>
              </View>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>İlçe</Text>
                <View style={styles.inputField}>
                  <Entypo name="location-pin" size={24} color="black" />
                  <SelectDropdown
                    data={districts}
                    defaultButtonText="Seçiniz"
                    onSelect={(selectedItem, index) => {
                      setFieldValue("ilce", selectedItem);
                      setselectedDistrict(selectedItem);
                    }}
                    buttonStyle={styles.dropdown}
                  />
                  {errors.ilce && (
                    <Text style={styles.error}>{errors.ilce}</Text>
                  )}
                </View>
              </View>
              <View style={styles.inputFields}>
                <Text style={styles.inputHeadText}>Mahalle</Text>
                <View style={styles.inputField}>
                  <Entypo name="location" size={24} color="black" />
                  <SelectDropdown
                    data={towns}
                    defaultButtonText="Seçiniz"
                    onSelect={(selectedItem, index) => {
                      setFieldValue("mahalle", selectedItem);
                    }}
                    buttonStyle={styles.dropdown}
                  />
                  {errors.mahalle && (
                    <Text style={styles.error}>{errors.mahalle}</Text>
                  )}
                </View>
              </View>
              <View style={styles.checkboxField}>
                <Checkbox
                  style={styles.checkbox}
                  value={values.kvkkonay}
                  onValueChange={(value) => setFieldValue("kvkkonay", value)}
                />
                <View style={styles.checkText}>
                  <Text>
                    <Text style={{ color: "#A4496B" }}>
                      Kişisel Verilerin Korunması Kanunu Ayrınlatma Metni'
                    </Text>
                    ni okudum ve bilgilendirildim.
                  </Text>
                </View>
              </View>
              <View style={styles.checkboxField}>
                <Checkbox
                  style={styles.checkbox}
                  value={values.sozlesmeonay}
                  onValueChange={(value) =>
                    setFieldValue("sozlesmeonay", value)
                  }
                />
                <View style={styles.checkText}>
                  <Text>
                    Alternatif Bank A.Ş.'nin ve/veya iş ortaklarının ürün,
                    hizmet ve kampanyalarını tanıtmaya yönelik gönderilecek
                    yazılı, sesli veya görsel mesajlar ile bilgilendirilmeyi
                    kabul ediyorum
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                values.kvkkonay && values.sozlesmeonay && styles.activeButton,
              ]}
              onPress={handleSubmit}
              disabled={!values.kvkkonay || !values.sozlesmeonay}
            >
              <Text style={styles.submitButtonTitle}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </Formik>
  );
};

export default BecomeCustomerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#902048",
    flexDirection: "row",
    gap: 140,
    alignItems: "center",
    height: 35,
    paddingLeft: 10,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#DEE1E5",
  },
  progress: {
    height: 10,
    width: "10%",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: "#BF3A6E",
  },
  infoContainer: {
    height: 100,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    color: "#6F374D",
    fontSize: 17,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  boldText: {
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
  },
  submitButtonContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "gray",
    elevation: 1,
  },
  submitButton: {
    backgroundColor: "#DAB8C8",
    width: "90%",
    height: "65%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#902048",
  },
  submitButtonTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  inputField: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  inputStyle: {
    flex: 1,
  },
  error: {
    flex: 1,
    flexWrap: "wrap",
  },
  inputFields: {
    paddingVertical: 10,
  },
  inputHeadText: {
    fontWeight: "bold",
    paddingVertical: 5,
  },
  checkboxField: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  checkText: {
    width: "93%",
  },
  seriNoHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seriNoPopup: {
    backgroundColor: "#902048",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  seriNoPopupText: {
    fontSize: 15,
    color: "white",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  dropdown: {
    flex: 1,
    backgroundColor: "#DEE1E5",
  },
});
