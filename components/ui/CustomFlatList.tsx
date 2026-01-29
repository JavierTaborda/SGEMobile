import { useScrollHeader } from "@/hooks/useScrollHeader";
import { appTheme } from "@/utils/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, FlashListProps, FlashListRef } from "@shopify/flash-list";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import TitleText from "./TitleText";
type Props<T> = {
  data: T[];
  renderItem: FlashListProps<T>["renderItem"];
  keyExtractor: FlashListProps<T>["keyExtractor"];
  refreshing: boolean;
  canRefresh: boolean;
  handleRefresh: () => void;
  cooldown?: number;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onHeaderVisibleChange?: (visible: boolean) => void;
  showtitle?: boolean;
  title?: string;
  subtitle?: string;
  numColumns?: number;
  showScrollTopButton?: boolean;
  pageSize?: number;
};

function CustomFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  canRefresh,
  handleRefresh,
  cooldown,
  ListEmptyComponent,
  onHeaderVisibleChange,
  showtitle = true,
  title,
  subtitle,
  numColumns = 1,
  showScrollTopButton = true,
  pageSize = 20,
}: Props<T>) {
  const flashListRef = useRef<FlashListRef<T>>(null);
  const { handleScroll, showScrollTop, headerVisible } = useScrollHeader();

  const [page, setPage] = useState(1);

  const paginatedData = useMemo(
    () => data.slice(0, page * pageSize),
    [data, page, pageSize],
  );

  useEffect(() => {
    if (onHeaderVisibleChange) {
      onHeaderVisibleChange(headerVisible);
    }
  }, [headerVisible]);

  const onCooldownPress = () => {
    const msg = `Espera ${cooldown} segundos antes de refrescar nuevamente`;
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg);
    }
  };

  const loadMore = useCallback(() => {
    if (paginatedData.length < data.length) {
      setPage((prev) => prev + 1);
    }
  }, [paginatedData, data]);

  return (
    <>
      {!canRefresh && cooldown ? (
        <TouchableOpacity
          onPress={onCooldownPress}
          activeOpacity={0.8}
          style={styles.cooldownBadge}
        >
          <Text style={styles.cooldownText}>
            Espera {cooldown}s para refrescar
          </Text>
        </TouchableOpacity>
      ) : null}

      {/*  scroll top */}
      {showScrollTop && showScrollTopButton && (
        <TouchableOpacity
          onPress={() =>
            flashListRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
          style={styles.scrollTopButton}
          className="bg-primary dark:bg-dark-primary p-4 rounded-full shadow-lg"
          accessibilityLabel="Subir al inicio"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* List */}
      <FlashList
        ref={flashListRef}
        data={paginatedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        numColumns={numColumns}
        refreshControl={
          <RefreshControl
            refreshing={canRefresh ? refreshing : false}
            onRefresh={canRefresh ? handleRefresh : undefined}
            enabled={canRefresh}
            {...(Platform.OS === "android" && {
              enabled: canRefresh,
              progressViewOffset: 100,
              colors: [
                appTheme.primary.DEFAULT,
                appTheme.primary.light,
                appTheme.secondary.DEFAULT,
              ],
            })}
            tintColor={appTheme.primary.DEFAULT}
            title="Recargando..."
            titleColor={appTheme.primary.DEFAULT}
          />
        }
        ListHeaderComponent={
          showtitle ? (
            <View className="pb-1">
              <TitleText title={title} subtitle={subtitle} />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          ListEmptyComponent ?? (
            <View style={styles.emptyWrapper}>
              <Text style={styles.emptyText}>No se encontraron datos...</Text>
            </View>
          )
        }
        ListFooterComponent={
          paginatedData.length < data.length ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator
                size="small"
                color={appTheme.primary.DEFAULT}
              />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </>
  );
}

export default React.memo(CustomFlatList) as typeof CustomFlatList;

const styles = StyleSheet.create({
  cooldownBadge: {
    position: "absolute",
    top: 0,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 10,
  },
  cooldownText: {
    color: "#fff",
    fontSize: 12,
  },
  scrollTopButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 50,
    elevation: 10,
  },
  listContent: {
    paddingBottom: 210,
    paddingHorizontal: 16,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
  },
});
