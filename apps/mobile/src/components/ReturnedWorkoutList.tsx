import { View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import Colors from "../constants/Colors";

const ReturnedWorkoutList = (props: {
  data: any[];
  renderItem: any;
  extraData?: any;
  style?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  listBottomInset?: number;
  onEndReached?: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
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
        onEndReached={props.onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          props.loadingMore ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color={Colors.accent} />
            </View>
          ) : props.hasMore ? (
            <View style={{ height: 24 }} />
          ) : null
        }
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
