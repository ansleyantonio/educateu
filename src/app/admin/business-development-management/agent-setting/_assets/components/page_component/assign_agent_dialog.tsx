"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuths } from "@/hooks/userContext"
import { useMutation, useQuery } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { assignAgentsToGroup } from "../../query_controller/assignAgentsToGroup"
import { fetchAllUnassignedAgents } from "../../query_controller/fetchAllUnassignedAgents"
import { fetchAssignedAgents } from "../../query_controller/fetchAssignedAgents"
import toast from "react-hot-toast";

type Agent = {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
}

type AssignedAgent = {
  userId: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
}

type AssignAgentDialogProps = {
  isOpen: boolean
  onClose: () => void
  groupType: "internal" | "external"
  commissionGroupId: string
  onAssign: (selectedAgents: Agent[]) => void
}

export const AssignAgentDialog = ({
  isOpen,
  onClose,
  groupType,
  onAssign,
  commissionGroupId,
}: AssignAgentDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("unassigned")
  const user = useAuths()
  const token = user?.user?.token

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);
  // Fetch unassigned agents
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["unassigned-agents", { token, agentType: groupType }],
    queryFn: fetchAllUnassignedAgents,
    enabled: isOpen && !!token,
  })

  const { data: assignedAgents = [] } = useQuery({
    queryKey: ["assigned-agents", commissionGroupId, token],
    queryFn: () =>
      fetchAssignedAgents({
        token: token!,
        commissionGroupId,
      }),
    enabled: isOpen && !!token && !!commissionGroupId,
  })

  // Initialize selectedIds from assigned agents
  // useEffect(() => {
  //   if (assignedAgents.length > 0) {
  //     setSelectedIds(assignedAgents.map((agent: AssignedAgent) => agent.userId))
  //   }
  // }, [assignedAgents])

  const assignMutation = useMutation({
    mutationFn: ({
      commissionGroupId,
      userIds,
    }: {
      commissionGroupId: string
      userIds: string[]
    }) => {
      if (!token) {
        throw new Error("Token is missing")
      }
      if (!userIds || userIds.length === 0) {
        throw new Error("No agents selected")
      }
      return assignAgentsToGroup({
        token,
        commissionGroupId,
        userIds,
      })
    },
    onSuccess: () => {
      toast.success("Agents assigned successfully")
      setSelectedIds([])
      setSearch("")
      onClose()
    },
    onError: (error) => {
      console.error("Assignment failed:", error)
    },
  })

  const toggleSelection = (id: string) => {
    console.log("TOFGGLE SECTION", id);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleRemoveChip = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id))
  }

  const getDisplayName = (agent: Agent | AssignedAgent) => {
    if ("firstName" in agent && "lastName" in agent) {
      return agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : agent.name || "Unknown"
    }
    return agent.name || "Unknown"
  }

  const filteredUnassignedAgents = agents.filter((agent) =>
    `${agent.firstName ?? ""} ${agent.lastName ?? ""} ${agent.name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredAssignedAgents = assignedAgents.filter((agent: AssignedAgent) =>
    `${agent.firstName ?? ""} ${agent.lastName ?? ""} ${agent.name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Select Agent ({groupType === "internal" ? "Internal" : "External"})</DialogTitle>
        </DialogHeader>

        {/* Search Field */}
        <Input
          placeholder="Search agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unassigned">Unassigned ({filteredUnassignedAgents.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({filteredAssignedAgents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned" className="mt-2">
            <div className="border rounded-md h-52 overflow-y-auto px-2 py-1">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading agents...</p>
              ) : filteredUnassignedAgents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No unassigned agents found</p>
              ) : (
                filteredUnassignedAgents.map((agent: Agent) => {
                  const displayName = getDisplayName(agent)
                  return (
                    <div key={agent.id} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded-sm">
                      <Checkbox
                        checked={selectedIds.includes(agent.id)}
                        onCheckedChange={() => toggleSelection(agent.id)}
                      />
                      <span>{displayName}</span>
                      <span className="text-xs text-gray-500 ml-auto">{agent.email}</span>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="assigned" className="mt-2">
            <div className="border rounded-md h-52 overflow-y-auto px-2 py-1">
              {filteredAssignedAgents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No assigned agents found</p>
              ) : (
                filteredAssignedAgents.map((agent: AssignedAgent) => {
                  const displayName = getDisplayName(agent)
                  return (
                    <div key={agent.userId} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded-sm">
                      {/* <Checkbox
                        checked={selectedIds.includes(agent.userId)}
                        onCheckedChange={() => toggleSelection(agent.userId)}
                      /> */}
                      <span>{displayName}</span>
                      <span className="text-xs text-gray-500 ml-auto">{agent.email}</span>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            className="border border-[#CFD6DD] text-[#4A545E] bg-white rounded-md px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#013E5B] text-white px-4 py-2 rounded-md text-sm"
            onClick={() => {
              assignMutation.mutate({ commissionGroupId, userIds: selectedIds })
            }}
          >
            Assign
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
// "use client"

// import { Checkbox } from "@/components/ui/checkbox"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { useAuths } from "@/hooks/userContext"
// import { useMutation, useQuery } from "@tanstack/react-query"
// import { X } from "lucide-react"
// import { useEffect, useState } from "react"
// import { assignAgentsToGroup } from "../../query_controller/assignAgentsToGroup"
// import { fetchAllUnassignedAgents } from "../../query_controller/fetchAllUnassignedAgents"
// import { fetchAssignedAgents } from "../../query_controller/fetchAssignedAgents"
// import toast from "react-hot-toast";

// type Agent = {
//   id: string
//   firstName?: string
//   lastName?: string
//   name?: string
//   email: string
// }

// type AssignedAgent = {
//   userId: string
//   firstName?: string
//   lastName?: string
//   name?: string
//   email: string
// }

// type AssignAgentDialogProps = {
//   isOpen: boolean
//   onClose: () => void
//   groupType: "internal" | "external"
//   commissionGroupId: string
//   onAssign: (selectedAgents: Agent[]) => void
// }

// export const AssignAgentDialog = ({
//   isOpen,
//   onClose,
//   groupType,
//   onAssign,
//   commissionGroupId,
// }: AssignAgentDialogProps) => {
//   const [selectedIds, setSelectedIds] = useState<string[]>([])
//   const [search, setSearch] = useState<string>("")
//   const [activeTab, setActiveTab] = useState<string>("unassigned")
//   const user = useAuths()
//   const token = user?.user?.token

//   useEffect(() => {
//     if (!isOpen) {
//       setSearch("");
//     }
//   }, [isOpen]);
//   // Fetch unassigned agents
//   const { data: agents = [], isLoading } = useQuery<Agent[]>({
//     queryKey: ["unassigned-agents", { token, agentType: groupType }],
//     queryFn: fetchAllUnassignedAgents,
//     enabled: isOpen && !!token,
//   })

//   const { data: assignedAgents = [] } = useQuery({
//     queryKey: ["assigned-agents", commissionGroupId, token],
//     queryFn: () =>
//       fetchAssignedAgents({
//         token: token!,
//         commissionGroupId,
//       }),
//     enabled: isOpen && !!token && !!commissionGroupId,
//   })

//   // Initialize selectedIds from assigned agents
//   // useEffect(() => {
//   //   if (assignedAgents.length > 0) {
//   //     setSelectedIds(assignedAgents.map((agent: AssignedAgent) => agent.userId))
//   //   }
//   // }, [assignedAgents])

//   const assignMutation = useMutation({
//     mutationFn: ({
//       commissionGroupId,
//       userIds,
//     }: {
//       commissionGroupId: string
//       userIds: string[]
//     }) => {
//       if (!token) {
//         throw new Error("Token is missing")
//       }
//       if (!userIds || userIds.length === 0) {
//         throw new Error("No agents selected")
//       }
//       return assignAgentsToGroup({
//         token,
//         commissionGroupId,
//         userIds,
//       })
//     },
//     onSuccess: () => {
//       toast.success("Agents assigned successfully")
//       setSelectedIds([])
//       setSearch("")
//       onClose()
//     },
//     onError: (error) => {
//       console.error("Assignment failed:", error)
//     },
//   })

//   const toggleSelection = (id: string) => {
//     console.log("TOFGGLE SECTION", id);
//     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
//   }

//   const handleRemoveChip = (id: string) => {
//     setSelectedIds((prev) => prev.filter((item) => item !== id))
//   }

//   const getDisplayName = (agent: Agent | AssignedAgent) => {
//     if ("firstName" in agent && "lastName" in agent) {
//       return agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : agent.name || "Unknown"
//     }
//     return agent.name || "Unknown"
//   }

//   const filteredUnassignedAgents = agents.filter((agent) =>
//     `${agent.firstName ?? ""} ${agent.lastName ?? ""} ${agent.name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
//   )

//   const filteredAssignedAgents = assignedAgents.filter((agent: AssignedAgent) =>
//     `${agent.firstName ?? ""} ${agent.lastName ?? ""} ${agent.name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
//   )

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-xl w-full">
//         <DialogHeader>
//           <DialogTitle>Select Agent ({groupType === "internal" ? "Internal" : "External"})</DialogTitle>
//         </DialogHeader>

//         {/* Search Field */}
//         <Input
//           placeholder="Search agent..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="mt-4"
//         />

//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="unassigned">Unassigned ({filteredUnassignedAgents.length})</TabsTrigger>
//             <TabsTrigger value="assigned">Assigned ({filteredAssignedAgents.length})</TabsTrigger>
//           </TabsList>

//           <TabsContent value="unassigned" className="mt-2">
//             <div className="border rounded-md h-52 overflow-y-auto px-2 py-1">
//               {isLoading ? (
//                 <p className="text-sm text-gray-500">Loading agents...</p>
//               ) : filteredUnassignedAgents.length === 0 ? (
//                 <p className="text-sm text-gray-500 text-center py-8">No unassigned agents found</p>
//               ) : (
//                 filteredUnassignedAgents.map((agent: Agent) => {
//                   const displayName = getDisplayName(agent)
//                   return (
//                     <div key={agent.id} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded-sm">
//                       <Checkbox
//                         checked={selectedIds.includes(agent.id)}
//                         onCheckedChange={() => toggleSelection(agent.id)}
//                       />
//                       <span>{displayName}</span>
//                       <span className="text-xs text-gray-500 ml-auto">{agent.email}</span>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </TabsContent>

//           <TabsContent value="assigned" className="mt-2">
//             <div className="border rounded-md h-52 overflow-y-auto px-2 py-1">
//               {filteredAssignedAgents.length === 0 ? (
//                 <p className="text-sm text-gray-500 text-center py-8">No assigned agents found</p>
//               ) : (
//                 filteredAssignedAgents.map((agent: AssignedAgent) => {
//                   const displayName = getDisplayName(agent)
//                   return (
//                     <div key={agent.userId} className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 rounded-sm">
//                       {/* <Checkbox
//                         checked={selectedIds.includes(agent.userId)}
//                         onCheckedChange={() => toggleSelection(agent.userId)}
//                       /> */}
//                       <span>{displayName}</span>
//                       <span className="text-xs text-gray-500 ml-auto">{agent.email}</span>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>

//         {/* Footer */}
//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             className="border border-[#CFD6DD] text-[#4A545E] bg-white rounded-md px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-[#013E5B] text-white px-4 py-2 rounded-md text-sm"
//             onClick={() => {
//               assignMutation.mutate({ commissionGroupId, userIds: selectedIds })
//             }}
//           >
//             Assign
//           </button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
