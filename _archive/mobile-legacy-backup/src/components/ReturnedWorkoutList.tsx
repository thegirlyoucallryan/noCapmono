import { View, FlatList, ListRenderItem } from 'react-native'
import { Exercise } from '../types/types'

const ReturnedWorkoutList = ({
  data,
  renderItem,
}: {
  data: Exercise[]
  renderItem: ListRenderItem<Exercise>
}) => {
  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        removeClippedSubviews={false}
        onEndReachedThreshold={0.1}
      />
    </View>
  )
}

export default ReturnedWorkoutList
