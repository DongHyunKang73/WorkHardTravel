import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  InputAccessoryView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {theme} from "./colors";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const storage_key= "@todos";
const start_storage_key= "@start_todos";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setTodos] = useState({});
  const [loading, setLoading] = useState(true);
  const [editText, setEditText] = useState("");

  const travel = async () => {
    setWorking(false);
    await SaveStartPosition(false);
  }
  const work = async () => {
    setWorking(true);
    await SaveStartPosition(true);
  }

  const onChangeText = (event) => {
    setText(event);
  }

  const onChangeEditText = (event) => {
    setEditText(event);
  }

  const addTodo = async () => {
    if(text==="")
      return;

    /*const newTodos = Object.assign({}, toDos, {
      [Date.now()] : {text, work: working}
      });*/

    const newTodos = {...toDos, [Date.now()] : {text, work: working, complete: false, edit: false}};

    setTodos(newTodos);

    await SaveToDos(newTodos);

    setText("");

    const obj = Object.keys(toDos);

    console.log(obj);
  }

  const SaveStartPosition = async (status) => {
    try {
      await AsyncStorage.setItem(start_storage_key, status ? "true" : "false");
    } catch (e) {
      // saving error
    }
  }

  const LoadStartPosition = async () => {
    try {
      const s = await AsyncStorage.getItem(start_storage_key);

      console.log("start pos : " + s);

      (s === "true") ? setWorking(true) : setWorking(false);

    } catch (e) {
      // saving error
    }
  }

  const SaveToDos = async (todos) => {
    console.log(todos);

    try {
      await AsyncStorage.setItem(storage_key, JSON.stringify(todos));
    } catch (e) {
      // saving error
    }
  }

  const LoadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(storage_key);

      if(s) {
        setTodos(JSON.parse(s));
        setLoading(false);
      }
    } catch (e) {
      // saving error
    }
  }

  const deleteToDo = (key) => {
    console.log(key);

    Alert.alert("Delete To Do?", "Are you sure?", [
      {text : "Cancel"},
      {text : "I'm Sure", onPress : async () => {
          const newToDos = {...toDos};

          delete newToDos[key];

          console.log(newToDos);

          setTodos(newToDos);
          await SaveToDos(newToDos);
        }}
    ]);
  }

  const completeToDo = async (key) => {
    console.log(key);
    const newToDos = {...toDos};

    if(newToDos[key].complete === true) {
      alert("이미 완료되었습니다.");
      return;
    }

    newToDos[key].complete = true;

    console.log(newToDos);

    setTodos(newToDos);
    await SaveToDos(newToDos);
  }

  const editToDo = (key) => {
    const newToDos = {...toDos};

    newToDos[key].edit = true;
    setEditText(newToDos[key].text);

    setTodos(newToDos);
  }

  const editToDoSubmit = async(key) => {
    const newToDos = {...toDos};

    newToDos[key].text = editText;
    newToDos[key].edit = false;

    setTodos(newToDos);
    await SaveToDos(newToDos);
  }

  const editToDoOut = (key) => {
    console.log(key);

    const newToDos = {...toDos};

    newToDos[key].edit = false;
    setEditText("");

    setTodos(newToDos);
  }

  useEffect(() => {
    LoadStartPosition();
    LoadToDos();
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white" : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
          onSubmitEditing={addTodo}
          keyboardType={"default"}
          returnKeyType={"done"}
          returnKeyLabel={"kuller"}
          secureTextEntry={false}
          multiline={false}
          autoCorrect={true}
          autoCapitalize={"words"}
          value={text}
          onChangeText={onChangeText}
          placeholderTextColor={"red"}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
      />
      {
        loading ? <ActivityIndicator color={"white"} size={"large"} /> :
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].work === working ?
            <View style={styles.toDo} key={key}>
              {toDos[key].edit ?
                  <TextInput onSubmitEditing={() => editToDoSubmit(key)}
                             keyboardType={"default"}
                             returnKeyType={"done"}
                             returnKeyLabel={"kuller"}
                             secureTextEntry={false}
                             multiline={false}
                             autoCorrect={true}
                             autoCapitalize={"words"}
                             value={editText}
                             onChangeText={onChangeEditText}
                             placeholderTextColor={"red"}
                             placeholder={working ? "Add a To Do" : "Where do you want?"}
                             style={styles.toDoEditText} />
                  :
                  <Text style={{...styles.toDoText, color : toDos[key].complete ? theme.grey : "white", textDecorationLine : toDos[key].complete ? "line-through" : "none"}}>
                    {toDos[key].text}
                  </Text>
              }
              <View style={styles.toDoIcon}>
                <TouchableOpacity onPress={() => editToDo(key)}>
                  <MaterialCommunityIcons name="playlist-edit" size={24} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => completeToDo(key)}>
                  <Fontisto name="check" size={18} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View> : null
        )}
      </ScrollView>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal : 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop:100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    borderRadius:30,
    fontSize: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  toDo:{
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  toDoEditText: {
    color: "red",
    fontSize: 18,
    fontWeight: "500",
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  toDoIcon: {
    flexDirection: "row",
    gap: 20,
  },
});
