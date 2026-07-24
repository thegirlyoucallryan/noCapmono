import { View, FlatList, RefreshControl } from "react-native";
import Colors from "../constants/Colors";

const ReturnedWorkoutList = (props: {
  data: any[];
  renderItem: any;
  extraData?: any;
  style?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  listBottomInset?: number;
}) => {
  return (
    <View style={[{ flex: 1 }, props.style]}>
      <FlatList
        data={props.data}
        extraData={props.extraData}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={props.renderItem}
        contentContainerStyle={{
          paddingBottom: props.listBottomInset ?? 16,
        }}
        refreshControl={
          props.onRefresh ? (
            <RefreshControl
              refreshing={props.refreshing ?? false}
              onRefresh={props.onRefresh}
              tintColor={Colors.accent}
            />
          ) : undefined
        }
      />
    </View>
  );
};

export default ReturnedWorkoutList;
