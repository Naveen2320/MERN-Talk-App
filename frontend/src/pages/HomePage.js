import { Box, Center, Container ,Text,Tab,TabPanel,Tabs,TabList,TabPanels } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import Login from '../components/authentication/Login'
import Signup from '../components/authentication/Signup'
import { useHistory } from 'react-router-dom'

function HomePage() {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push('/chats'); // if user info is present then move into the next page
    
  },[history])


  return (
    <Container maxW="xl" centerContent>
      <Box d="flex"  justifyContent="center" alignItems="center" p={3} bg={'aqua'} w="100%" m="40px 0 15px 0" borderRadius="lg" borderWidth="1px">
        <Text textAlign= "center"  fontSize="4xl" fontWeight={'bold'} fontFamily="work sans" color= "black">Talk-A-Tive</Text> 
      </Box>

      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px" color="black">
        <Tabs variant='soft-rounded' >
          <TabList>
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login/> 
            </TabPanel>

            <TabPanel>
              <Signup/> 
            </TabPanel>

          </TabPanels>
        </Tabs>

      </Box>

    </Container>
  )
}

export default HomePage