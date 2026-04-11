import React, { useState } from 'react'
import { View, Button, StyleSheet, SafeAreaView } from 'react-native'
import CustomAlert from '../components/customs/Alert'
import { Colors } from '../constants/colors'

export default function TestAlertScreen() {
  const [successVisible, setSuccessVisible] = useState(false)
  const [errorVisible, setErrorVisible] = useState(false)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Button 
          title="Show Success Alert (1 Button)" 
          onPress={() => setSuccessVisible(true)} 
        />
        
        <View style={{ height: 20 }} />
        
        <Button 
          title="Show Error Alert (2 Buttons)" 
          color={Colors.danger}
          onPress={() => setErrorVisible(true)} 
        />
      </View>

      {/* Success Alert */}
      <CustomAlert
        isVisible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="Congratulations"
        description="You've just displayed this awesome Pop Up View successfully."
        iconName="Check"
        color="#16A34A"
        primaryButtonLabel="Done"
        onPrimaryPress={() => setSuccessVisible(false)}
      />

      {/* Error Alert with 2 Buttons */}
      <CustomAlert
        isVisible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Are you sure?"
        description="This action cannot be undone. Do you really want to delete this item?"
        iconName="AlertCircle"
        color={Colors.danger}
        primaryButtonLabel="Delete"
        onPrimaryPress={() => {
          console.log('Deleted!')
          setErrorVisible(false)
        }}
        secondaryButtonLabel="Cancel"
        onSecondaryPress={() => setErrorVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
})
