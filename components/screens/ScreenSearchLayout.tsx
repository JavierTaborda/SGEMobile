import FilterButton from '@/components/ui/FilterButton';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import SearchBar from '../ui/SearchBar';

// Reanimated v4
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ScreenSearchLayoutProps = {
  searchText: string;
  setSearchText: (text: string) => void;
  placeholder?: string;
  onFilterPress: () => void;
  filterCount?: number;
  children: React.ReactNode;
  extrafilter?: boolean;
  extraFiltersComponent?: React.ReactNode;
  showfilterButton?:boolean;
  headerVisible?: boolean;
};
/**
 * Layout component for screens that include a search bar and filter options.
 * Includes animated visibility for an optional extra filter section.
 *
 * @param {string} searchText - Current text in the search input field.
 * @param {(text: string) => void} setSearchText - Function to update the search text state.
 * @param {string} [placeholder] - Placeholder text shown in the search bar when empty.
 * @param {() => void} onFilterPress - Function triggered when the filter button is pressed.
 * @param {number} [filterCount] - Number of active filters, displayed as a badge on the filter button.
 * @param {React.ReactNode} children - Main content of the screen, rendered below the search and filter section.
 * @param {boolean} [extrafilter] - If true, displays an additional horizontal scrollable filter row.
 * @param {React.ReactNode} [extraFiltersComponent] - Custom component rendered alongside the filter button in the extra filter row.
 * @param {boolean} [showfilterButton] - If true, shows the filter button inside the extra filter row. Defaults to true.
 * @param {boolean} [headerVisible] - Controls the visibility of the animated extra filter section. Defaults to true.
 */


export default function ScreenSearchLayout({
  searchText,
  setSearchText,
  placeholder = '',
  onFilterPress,
  children,
  extrafilter = false,
  extraFiltersComponent,
  filterCount,
  headerVisible = true,
  showfilterButton=true,
}: ScreenSearchLayoutProps) {

  const animatedValue = useSharedValue(headerVisible ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withTiming(headerVisible ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.exp),
    });
  }, [headerVisible]);

  // Use useAnimatedStyle 
  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedValue.value * 48,
    opacity: animatedValue.value,
    transform: [
      { scaleY: 0.95 + 0.05 * animatedValue.value },
    ],
    overflow: 'hidden',
  }));

  return (
    <View className="flex-1  bg-primary dark:bg-dark-primary ">
     

      <View className="flex-1 relative bg-background dark:bg-dark-background rounded-t-3xl pt-3 ">
        {/* Search & Filter row */}
        <View className="flex-row items-center gap-0 pb-2 px-4">
          <View className={extrafilter ? "flex-1" : "w-4/5"}>
            <SearchBar
              searchText={searchText}
              setSearchText={setSearchText}
              placeHolderText={placeholder}
              isFull={extrafilter}
            />
          </View>
          {!extrafilter && (
            <View className="w-1/5 items-end">
              <FilterButton onPress={onFilterPress} filterCount={filterCount} />
            </View>
          )}
        </View>
        <Animated.View style={animatedStyle} className="px-4">
          {/* Extra filters row */}
          {extrafilter && (
            <View className="flex-row">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-1.5"
              >
                
                {showfilterButton && (<View className="justify-center items-start">
                  <FilterButton
                    onPress={onFilterPress}
                    filterCount={filterCount}
                    title={extrafilter}
                  />
                </View>)}
                <View>{extraFiltersComponent}</View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
        {/* Content */}

        {children}
      </View>
    </View>
  );
}
