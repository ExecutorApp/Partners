import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HeaderProps {
  title: string;
  notificationCount: number;
  onMenuPress: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, notificationCount, onMenuPress, showBackButton = false, onBackPress }) => {
  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfcfc" />
      
      <View style={styles.statusBar}>
        <Text style={[styles.statusTime, styles.statusTimeHidden]}>9:41</Text>
        <View style={styles.statusIcons}>
        </View>
      </View>
      
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19L5 12L12 5" stroke="#3A3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        )}
        
        <View style={[styles.titleContainer, showBackButton && styles.titleWithBack]}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <View style={styles.notificationContainer}>
            <View style={styles.bellIcon}>
              <Svg width={22} height={26} viewBox="0 0 22 26" fill="none">
                <Path d="M14.3895 20.1344V21.0575C14.3895 22.0368 14.0067 22.976 13.3254 23.6685C12.644 24.361 11.7198 24.75 10.7562 24.75C9.79263 24.75 8.86849 24.361 8.18711 23.6685C7.50574 22.976 7.12295 22.0368 7.12295 21.0575V20.1344M20.5025 18.2563C19.0446 16.4429 18.0154 15.5198 18.0154 10.5206C18.0154 5.94251 15.715 4.31149 13.8218 3.51934C13.5703 3.41434 13.3335 3.17317 13.2569 2.91066C12.9248 1.76196 11.9938 0.75 10.7562 0.75C9.51858 0.75 8.58699 1.76254 8.25829 2.91182C8.18165 3.17721 7.94492 3.41434 7.69343 3.51934C5.79788 4.31264 3.49982 5.9379 3.49982 10.5206C3.49699 15.5198 2.46775 16.4429 1.00989 18.2563C0.405857 19.0075 0.934954 20.1354 1.99144 20.1354H19.5266C20.5774 20.1354 21.1031 19.004 20.5025 18.2563Z" stroke="#3A3F51" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.menuIcon}
            onPress={onMenuPress}
          >
            <Svg width={20} height={17} viewBox="0 0 18 15" fill="none">
              <Path d="M0 1.25C0 0.558594 0.558594 0 1.25 0H16.25C16.9414 0 17.5 0.558594 17.5 1.25C17.5 1.94141 16.9414 2.5 16.25 2.5H1.25C0.558594 2.5 0 1.94141 0 1.25ZM0 7.5C0 6.80859 0.558594 6.25 1.25 6.25H16.25C16.9414 6.25 17.5 6.80859 17.5 7.5C17.5 8.19141 16.9414 8.75 16.25 8.75H1.25C0.558594 8.75 0 8.19141 0 7.5ZM17.5 13.75C17.5 14.4414 16.9414 15 16.25 15H1.25C0.558594 15 0 14.4414 0 13.75C0 13.0586 0.558594 12.5 1.25 12.5H16.25C16.9414 12.5 17.5 13.0586 17.5 13.75Z" fill="#3A3F51" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fcfcfccc',
    paddingTop: 1,
    paddingBottom: 1,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusTime: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTimeHidden: {
    opacity: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  titleContainer: {
    paddingLeft: 16,
    paddingRight: 126,
  },
  titleWithBack: {
    paddingLeft: 0,
    flex: 1,
  },
  backButton: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3a3f51',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    width: 71,
  },
  notificationContainer: {
    position: 'relative',
    marginLeft: -10,
    width: 28,
    height: 28,
  },
  bellIcon: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: 22,
    height: 26,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    left: 10,
  },
  badgeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1777cf',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#fcfcfc',
    textAlign: 'center',
  },
  menuIcon: {
    marginLeft: 16,
    width: 18,
    height: 31,
    paddingTop: 10,
  },
});

export default Header;